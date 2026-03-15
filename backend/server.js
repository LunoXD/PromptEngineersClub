import cors from 'cors';
import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import http from 'http';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { connectDatabase } from '../database/connection.js';
import { Project } from '../database/models/Project.js';
import { TeamMember } from '../database/models/TeamMember.js';
import { HomeContent } from '../database/models/HomeContent.js';
import { Plan } from '../database/models/Plan.js';
import { User } from '../database/models/User.js';
import { ChatServer } from '../database/models/ChatServer.js';
import { Message } from '../database/models/Message.js';
import { requireChatAdmin, requireUser } from './userMiddleware.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createChatRouter, setupChatSocket } from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLocalDevOrigin(origin) {
  try {
    const parsed = new URL(origin);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    return isLocalHost && isHttp;
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  return allowedOrigins.includes(origin) || isLocalDevOrigin(origin);
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin || isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin(origin, cb) {
      if (!origin || isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const PORT = Number(process.env.PORT || 5001);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 140,
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/api/auth', authLimiter, createAuthRouter({ googleClient, googleClientId: GOOGLE_CLIENT_ID }));

async function ensureBootstrapData() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@prompt.local';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'PromptAdmin@2026';

  const testCleanupResult = await User.deleteMany({
    role: 'user',
    $or: [
      { email: /@example\.com$/i },
      { email: /test|demo|sample|fake/i },
      { username: /test|demo|sample|fake/i },
    ],
  });
  if (testCleanupResult.deletedCount > 0) {
    console.log(`Removed ${testCleanupResult.deletedCount} test user(s)`);
  }

  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    adminUser = await User.create({
      username: 'admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log('[BOOTSTRAP] Admin account created');
    console.log(`[BOOTSTRAP] Email: ${adminEmail}`);
    console.log(`[BOOTSTRAP] Password: ${adminPassword}`);
  } else if (adminUser.role !== 'admin') {
    adminUser.role = 'admin';
    await adminUser.save();
  }

  adminUser.passwordHash = await bcrypt.hash(adminPassword, 10);
  await adminUser.save();
  console.log('[BOOTSTRAP] Admin credentials ready');
  console.log(`[BOOTSTRAP] Email: ${adminEmail}`);
  console.log(`[BOOTSTRAP] Password: ${adminPassword}`);

  const serverCount = await ChatServer.countDocuments();
  if (serverCount === 0) {
    await ChatServer.create({
      name: 'Prompt Community',
      description: 'Default server',
      owner: adminUser._id,
      members: [adminUser._id],
      isDefault: true,
    });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/verify', requireUser, requireChatAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/users', requireUser, requireChatAdmin, async (_req, res) => {
  const users = await User.find()
    .select('_id username email role avatarUrl createdAt')
    .sort({ createdAt: -1 });
  res.json(users);
});

app.patch('/api/admin/users/:id', requireUser, requireChatAdmin, async (req, res) => {
  const nextRole = req.body?.role;
  if (!['admin', 'user'].includes(nextRole)) {
    return res.status(400).json({ message: 'Role must be admin or user' });
  }

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  if (target._id.toString() === req.user._id.toString() && nextRole !== 'admin') {
    return res.status(400).json({ message: 'You cannot remove your own admin role' });
  }

  if (target.role === 'admin' && nextRole === 'user') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) {
      return res.status(400).json({ message: 'At least one admin is required' });
    }
  }

  target.role = nextRole;
  await target.save();
  res.json(target);
});

app.delete('/api/admin/users/:id', requireUser, requireChatAdmin, async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  if (target._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  if (target.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) {
      return res.status(400).json({ message: 'At least one admin is required' });
    }
  }

  await ChatServer.updateMany(
    { members: target._id },
    { $pull: { members: target._id } }
  );
  await ChatServer.updateMany(
    { owner: target._id },
    { $set: { owner: req.user._id }, $addToSet: { members: req.user._id } }
  );
  await Message.deleteMany({ userId: target._id });
  await User.deleteOne({ _id: target._id });

  res.json({ ok: true });
});

app.get('/api/admin/servers', requireUser, requireChatAdmin, async (_req, res) => {
  const servers = await ChatServer.find()
    .populate('owner', '_id username email role')
    .populate('members', '_id username email role avatarUrl')
    .sort({ isDefault: -1, createdAt: 1 });

  const payload = servers.map((server) => ({
    _id: server._id,
    name: server.name,
    description: server.description,
    isDefault: server.isDefault,
    owner: server.owner,
    members: server.members,
    memberCount: server.members?.length || 0,
    createdAt: server.createdAt,
  }));

  res.json(payload);
});

app.patch('/api/admin/servers/:id/access', requireUser, requireChatAdmin, async (req, res) => {
  const userId = req.body?.userId;
  const action = req.body?.action;

  if (!userId || !['grant', 'revoke'].includes(action)) {
    return res.status(400).json({ message: 'userId and action(grant|revoke) are required' });
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) return res.status(404).json({ message: 'User not found' });

  const server = await ChatServer.findById(req.params.id);
  if (!server) return res.status(404).json({ message: 'Server not found' });

  if (action === 'grant') {
    await ChatServer.updateOne({ _id: server._id }, { $addToSet: { members: targetUser._id } });
  } else {
    if (server.owner?.toString() === targetUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot revoke owner access from own server' });
    }
    await ChatServer.updateOne({ _id: server._id }, { $pull: { members: targetUser._id } });
  }

  const updated = await ChatServer.findById(req.params.id)
    .populate('owner', '_id username email role')
    .populate('members', '_id username email role avatarUrl');
  res.json(updated);
});

app.delete('/api/admin/servers/:id', requireUser, requireChatAdmin, async (req, res) => {
  const server = await ChatServer.findById(req.params.id);
  if (!server) return res.status(404).json({ message: 'Server not found' });
  if (server.isDefault) {
    return res.status(400).json({ message: 'Default server cannot be deleted' });
  }

  await Message.deleteMany({ serverId: server._id });
  await ChatServer.deleteOne({ _id: server._id });
  res.json({ ok: true });
});

app.post('/api/upload', writeLimiter, requireUser, requireChatAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/projects', async (_req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

app.post('/api/projects', requireUser, requireChatAdmin, async (req, res) => {
  const created = await Project.create(req.body);
  res.status(201).json(created);
});

app.put('/api/projects/:id', requireUser, requireChatAdmin, async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ message: 'Project not found' });
  res.json(updated);
});

app.delete('/api/projects/:id', requireUser, requireChatAdmin, async (req, res) => {
  const removed = await Project.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Project not found' });
  res.status(204).send();
});

app.get('/api/team', async (_req, res) => {
  const members = await TeamMember.find().sort({ order: 1, createdAt: -1 });
  res.json(members);
});

app.post('/api/team', requireUser, requireChatAdmin, async (req, res) => {
  const created = await TeamMember.create(req.body);
  res.status(201).json(created);
});

app.put('/api/team/:id', requireUser, requireChatAdmin, async (req, res) => {
  const updated = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ message: 'Team member not found' });
  res.json(updated);
});

app.delete('/api/team/:id', requireUser, requireChatAdmin, async (req, res) => {
  const removed = await TeamMember.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Team member not found' });
  res.status(204).send();
});

app.get('/api/plans', async (_req, res) => {
  const plans = await Plan.find().sort({ category: 1, order: 1, createdAt: -1 });
  res.json(plans);
});

app.post('/api/plans', requireUser, requireChatAdmin, async (req, res) => {
  const created = await Plan.create(req.body);
  res.status(201).json(created);
});

app.put('/api/plans/:id', requireUser, requireChatAdmin, async (req, res) => {
  const updated = await Plan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ message: 'Plan not found' });
  res.json(updated);
});

app.delete('/api/plans/:id', requireUser, requireChatAdmin, async (req, res) => {
  const removed = await Plan.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Plan not found' });
  res.status(204).send();
});

async function getOrCreateHomeContent() {
  let content = await HomeContent.findOne();
  if (!content) {
    content = await HomeContent.create({
      heroBadge: 'Applications Open',
      heroDescription:
        'Empowering engineering students through innovation, collaboration, and continuous learning.',
      stats: [],
      features: [],
    });
    return content;
  }

  const isSeededStats =
    Array.isArray(content.stats) &&
    content.stats.length === 3 &&
    content.stats[0]?.label === 'Active Members' &&
    content.stats[0]?.value === '24+' &&
    content.stats[1]?.label === 'Projects Built' &&
    content.stats[1]?.value === '8' &&
    content.stats[2]?.label === 'Workshops Hosted' &&
    content.stats[2]?.value === '12';

  const isSeededFeatures =
    Array.isArray(content.features) &&
    content.features.length === 3 &&
    content.features[0]?.title === 'Community Building' &&
    content.features[1]?.title === 'Hands-On Projects' &&
    content.features[2]?.title === 'Events & Sessions';

  const shouldNormalizeArrays = !Array.isArray(content.stats) || !Array.isArray(content.features);

  const changed = isSeededStats || isSeededFeatures || shouldNormalizeArrays;
  if (changed) {
    content.stats = isSeededStats || !Array.isArray(content.stats) ? [] : content.stats;
    content.features = isSeededFeatures || !Array.isArray(content.features) ? [] : content.features;
  }

  if (changed) {
    await content.save();
  }

  return content;
}

app.get('/api/content/home', async (_req, res) => {
  const content = await getOrCreateHomeContent();
  res.json(content);
});

app.put('/api/content/home', requireUser, requireChatAdmin, async (req, res) => {
  const current = await getOrCreateHomeContent();
  current.heroBadge = req.body?.heroBadge ?? '';
  current.heroDescription = req.body?.heroDescription ?? '';
  current.stats = Array.isArray(req.body?.stats) ? req.body.stats : [];
  current.features = Array.isArray(req.body?.features) ? req.body.features : [];
  await current.save();
  res.json(current);
});

app.use('/api/chat', createChatRouter({ io, writeLimiter }));
setupChatSocket(io);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

connectDatabase()
  .then(async () => {
    await ensureBootstrapData();
    httpServer.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect database:', err);
    process.exit(1);
  });
