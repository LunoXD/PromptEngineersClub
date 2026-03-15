import mongoose from 'mongoose';
import { messageSchema } from '../schemas/messageSchema.js';

export const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
