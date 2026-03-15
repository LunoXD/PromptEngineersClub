import mongoose from 'mongoose';
import { chatServerSchema } from '../schemas/chatServerSchema.js';

export const ChatServer =
  mongoose.models.ChatServer || mongoose.model('ChatServer', chatServerSchema);
