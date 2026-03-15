import mongoose from 'mongoose';
import { projectSchema } from '../schemas/projectSchema.js';

export const Project =
  mongoose.models.Project || mongoose.model('Project', projectSchema);
