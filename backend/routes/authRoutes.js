import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../../database/models/User.js';
import { requireUser } from '../userMiddleware.js';
import { signUserToken } from '../jwtAuth.js';
import { sanitizePlainText, sanitizeUser } from '../utils/sanitize.js';

const signupSchema = z.object({
  username: z.string().trim().min(2).max(40),
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(128),
});

const googleSchema = z.object({
  credential: z.string().min(20),
});

const isAllowedAvatarUrl = (value) => {
  if (!value) return true;
  if (value.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const profileSchema = z.object({
  username: z.string().trim().min(2).max(40).optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine(isAllowedAvatarUrl, 'Avatar URL must be http(s) or /uploads/...')
    .optional(),
});

function parseBody(schema, body) {
  const result = schema.safeParse(body || {});
  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0]?.message || 'Invalid request body',
    };
  }
  return { ok: true, data: result.data };
}

export function createAuthRouter({ googleClient, googleClientId }) {
  const router = express.Router();

  router.post('/signup', async (req, res) => {
    const parsed = parseBody(signupSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });
    const { username, email, password } = parsed.data;

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: sanitizePlainText(username, 40),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
    });

    res.status(201).json({ message: 'Account created', user: sanitizeUser(user) });
  });

  router.post('/login', async (req, res) => {
    const parsed = parseBody(loginSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });
    const { email, password } = parsed.data;

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signUserToken(user);
    res.json({ token, user: sanitizeUser(user) });
  });

  router.post('/google', async (req, res) => {
    const parsed = parseBody(googleSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });
    const { credential } = parsed.data;

    if (!googleClient || !googleClientId) {
      return res.status(500).json({ message: 'Google OAuth is not configured on server' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: normalizedEmail }] });
    if (!user) {
      user = await User.create({
        username: sanitizePlainText(payload.name || payload.email.split('@')[0], 40),
        email: normalizedEmail,
        googleId: payload.sub,
        avatarUrl: payload.picture || '',
        role: 'user',
      });
    } else {
      if (!user.googleId) user.googleId = payload.sub;
      if (!user.avatarUrl && payload.picture) user.avatarUrl = payload.picture;
      await user.save();
    }

    const token = signUserToken(user);
    res.json({ token, user: sanitizeUser(user) });
  });

  router.get('/me', requireUser, async (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
  });

  router.post('/logout', requireUser, (_req, res) => {
    res.json({ ok: true });
  });

  router.patch('/profile', requireUser, async (req, res) => {
    const parsed = parseBody(profileSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });

    if (parsed.data.username !== undefined) {
      req.user.username = sanitizePlainText(parsed.data.username, 40);
    }
    if (parsed.data.avatarUrl !== undefined) {
      req.user.avatarUrl = parsed.data.avatarUrl;
    }

    await req.user.save();
    res.json({ user: sanitizeUser(req.user) });
  });

  return router;
}
