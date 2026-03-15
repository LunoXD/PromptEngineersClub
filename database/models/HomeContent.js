import mongoose from 'mongoose';
import { homeContentSchema } from '../schemas/homeContentSchema.js';

export const HomeContent =
  mongoose.models.HomeContent || mongoose.model('HomeContent', homeContentSchema);
