import express from 'express';
import { z } from 'zod';
import { ChatServer } from '../../database/models/ChatServer.js';
import { Message } from '../../database/models/Message.js';
import { User } from '../../database/models/User.js';
import { verifyUserToken } from '../jwtAuth.js';
import { requireChatAdmin, requireUser } from '../userMiddleware.js';
import { sanitizePlainText } from '../utils/sanitize.js';

const createServerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().trim().max(200).optional(),
});

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  replyToMessageId: z.string().trim().optional(),
});

const updateMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

const reactMessageSchema = z.object({
  emoji: z.string().trim().min(1).max(16),
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

async function hasServerAccess(serverId, userId) {
  const server = await ChatServer.findById(serverId);
  if (!server) return false;
  return server.members.some((member) => member.toString() === userId.toString());
}

function mapReactionsForUser(reactions = [], userId) {
  return (reactions || [])
    .map((reaction) => {
      const users = (reaction.users || []).map((entry) => entry.toString());
      return {
        emoji: reaction.emoji,
        users,
        count: users.length,
      };
    })
    .filter((reaction) => reaction.count > 0);
}

function serializeReplyPreview(replyDoc) {
  if (!replyDoc) return null;
  return {
    _id: replyDoc._id,
    content: replyDoc.content,
    user: replyDoc.userId || null,
  };
}

function serializeMessage(message, currentUserId) {
  return {
    _id: message._id,
    serverId: message.serverId,
    content: message.content,
    createdAt: message.createdAt,
    editedAt: message.editedAt,
    user: message.userId,
    replyTo: serializeReplyPreview(message.replyTo),
    reactions: mapReactionsForUser(message.reactions, currentUserId),
  };
}

export function createChatRouter({ io, writeLimiter }) {
  const router = express.Router();

  router.get('/servers', requireUser, async (req, res) => {
    const servers = await ChatServer.find().sort({ isDefault: -1, createdAt: 1 });
    const payload = servers.map((server) => ({
      _id: server._id,
      name: server.name,
      description: server.description,
      isDefault: server.isDefault,
      isMember: server.members.some((id) => id.toString() === req.user._id.toString()),
    }));
    res.json(payload);
  });

  router.post('/servers', writeLimiter, requireUser, requireChatAdmin, async (req, res) => {
    const parsed = parseBody(createServerSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });
    const { name, description } = parsed.data;

    const created = await ChatServer.create({
      name: sanitizePlainText(name, 50),
      description: sanitizePlainText(description || '', 200),
      owner: req.user._id,
      members: [req.user._id],
      isDefault: false,
    });
    res.status(201).json(created);
  });

  router.put('/servers/:id', requireUser, requireChatAdmin, async (req, res) => {
    const updated = await ChatServer.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body?.name,
        description: req.body?.description,
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Server not found' });
    res.json(updated);
  });

  router.post('/servers/:id/join', requireUser, async (req, res) => {
    const updated = await ChatServer.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user._id } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Server not found' });
    res.json({ ok: true });
  });

  router.get('/servers/:id/messages', requireUser, async (req, res) => {
    const access = await hasServerAccess(req.params.id, req.user._id);
    if (!access) return res.status(403).json({ message: 'Join server first' });

    const messages = await Message.find({ serverId: req.params.id })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('userId', 'username avatarUrl role')
      .populate({
        path: 'replyTo',
        select: 'content userId',
        populate: { path: 'userId', select: 'username avatarUrl role' },
      });

    res.json(messages.map((message) => serializeMessage(message, req.user._id)));
  });

  router.get('/servers/:id/members', requireUser, async (req, res) => {
    const access = await hasServerAccess(req.params.id, req.user._id);
    if (!access) return res.status(403).json({ message: 'Join server first' });

    const server = await ChatServer.findById(req.params.id).select('members');
    if (!server) return res.status(404).json({ message: 'Server not found' });

    const members = await User.find({ _id: { $in: server.members } })
      .select('_id username avatarUrl role')
      .sort({ username: 1 });

    res.json(members);
  });

  router.post('/servers/:id/messages', writeLimiter, requireUser, async (req, res) => {
    const access = await hasServerAccess(req.params.id, req.user._id);
    if (!access) return res.status(403).json({ message: 'Join server first' });

    const parsed = parseBody(createMessageSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });

    const replyToMessageId = parsed.data.replyToMessageId;
    let replyTarget = null;
    if (replyToMessageId) {
      replyTarget = await Message.findOne({
        _id: replyToMessageId,
        serverId: req.params.id,
      });
      if (!replyTarget) {
        return res.status(400).json({ message: 'Reply target not found in this server' });
      }
    }

    const message = await Message.create({
      serverId: req.params.id,
      userId: req.user._id,
      content: sanitizePlainText(parsed.data.content, 2000),
      replyTo: replyTarget?._id,
    });
    await message.populate('userId', 'username avatarUrl role');
    await message.populate({
      path: 'replyTo',
      select: 'content userId',
      populate: { path: 'userId', select: 'username avatarUrl role' },
    });

    const payload = serializeMessage(message, req.user._id);

    io.to(req.params.id).emit('chat:new-message', payload);
    res.status(201).json(payload);
  });

  router.patch('/servers/:serverId/messages/:messageId', writeLimiter, requireUser, async (req, res) => {
    const access = await hasServerAccess(req.params.serverId, req.user._id);
    if (!access) return res.status(403).json({ message: 'Join server first' });

    const parsed = parseBody(updateMessageSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });

    const message = await Message.findOne({
      _id: req.params.messageId,
      serverId: req.params.serverId,
    })
      .populate('userId', 'username avatarUrl role')
      .populate({
        path: 'replyTo',
        select: 'content userId',
        populate: { path: 'userId', select: 'username avatarUrl role' },
      });

    if (!message) return res.status(404).json({ message: 'Message not found' });

    const isOwner = message.userId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    message.content = sanitizePlainText(parsed.data.content, 2000);
    message.editedAt = new Date();
    await message.save();

    const payload = serializeMessage(message, req.user._id);

    io.to(req.params.serverId).emit('chat:message-updated', payload);
    res.json(payload);
  });

  router.delete('/servers/:serverId/messages/:messageId', writeLimiter, requireUser, async (req, res) => {
    const access = await hasServerAccess(req.params.serverId, req.user._id);
    if (!access) return res.status(403).json({ message: 'Join server first' });

    const message = await Message.findOne({
      _id: req.params.messageId,
      serverId: req.params.serverId,
    }).populate('userId', 'username avatarUrl role');

    if (!message) return res.status(404).json({ message: 'Message not found' });

    const isOwner = message.userId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await Message.deleteOne({ _id: message._id });

    io.to(req.params.serverId).emit('chat:message-deleted', {
      _id: req.params.messageId,
      serverId: req.params.serverId,
    });

    res.json({ ok: true });
  });

  router.post('/servers/:serverId/messages/:messageId/reactions', writeLimiter, requireUser, async (req, res) => {
    const access = await hasServerAccess(req.params.serverId, req.user._id);
    if (!access) return res.status(403).json({ message: 'Join server first' });

    const parsed = parseBody(reactMessageSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.message });

    const emoji = parsed.data.emoji.trim();

    const message = await Message.findOne({
      _id: req.params.messageId,
      serverId: req.params.serverId,
    })
      .populate('userId', 'username avatarUrl role')
      .populate({
        path: 'replyTo',
        select: 'content userId',
        populate: { path: 'userId', select: 'username avatarUrl role' },
      });

    if (!message) return res.status(404).json({ message: 'Message not found' });

    const existing = message.reactions.find((entry) => entry.emoji === emoji);
    const currentUserId = req.user._id.toString();

    if (!existing) {
      message.reactions.push({ emoji, users: [req.user._id] });
    } else {
      const alreadyReacted = existing.users.some((id) => id.toString() === currentUserId);
      if (alreadyReacted) {
        existing.users = existing.users.filter((id) => id.toString() !== currentUserId);
      } else {
        existing.users.push(req.user._id);
      }
    }

    message.reactions = message.reactions.filter((entry) => (entry.users || []).length > 0);
    await message.save();

    const payload = {
      _id: message._id,
      serverId: message.serverId,
      reactions: mapReactionsForUser(message.reactions, req.user._id),
    };

    io.to(req.params.serverId).emit('chat:message-reactions', payload);
    res.json(payload);
  });

  return router;
}

export function setupChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyUserToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('Unauthorized'));
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('chat:join-server', async ({ serverId }) => {
      if (!serverId || !socket.data.user?._id) return;
      const access = await hasServerAccess(serverId, socket.data.user._id);
      if (!access) return;
      socket.join(serverId);
    });

    socket.on('chat:send-message', async ({ serverId, content }) => {
      if (!serverId || !content?.trim() || !socket.data.user?._id) return;
      const access = await hasServerAccess(serverId, socket.data.user._id);
      if (!access) return;

      const parsed = createMessageSchema.safeParse({ content: String(content || '') });
      if (!parsed.success) return;

      const message = await Message.create({
        serverId,
        userId: socket.data.user._id,
        content: sanitizePlainText(parsed.data.content, 2000),
      });
      await message.populate('userId', 'username avatarUrl role');

      io.to(serverId).emit('chat:new-message', {
        _id: message._id,
        serverId: message.serverId,
        content: message.content,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        user: message.userId,
        replyTo: null,
        reactions: [],
      });
    });

    socket.on('chat:typing-start', async ({ serverId }) => {
      if (!serverId || !socket.data.user?._id) return;
      const access = await hasServerAccess(serverId, socket.data.user._id);
      if (!access) return;

      socket.to(serverId).emit('chat:typing', {
        serverId,
        isTyping: true,
        user: {
          _id: socket.data.user._id,
          username: socket.data.user.username,
          avatarUrl: socket.data.user.avatarUrl,
        },
      });
    });

    socket.on('chat:typing-stop', async ({ serverId }) => {
      if (!serverId || !socket.data.user?._id) return;
      const access = await hasServerAccess(serverId, socket.data.user._id);
      if (!access) return;

      socket.to(serverId).emit('chat:typing', {
        serverId,
        isTyping: false,
        user: {
          _id: socket.data.user._id,
          username: socket.data.user.username,
          avatarUrl: socket.data.user.avatarUrl,
        },
      });
    });
  });
}
