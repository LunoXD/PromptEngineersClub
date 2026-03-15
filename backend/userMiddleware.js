import { User } from '../database/models/User.js';
import { extractBearerToken, verifyUserToken } from './jwtAuth.js';

export async function requireUser(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = verifyUserToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function requireChatAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
}
