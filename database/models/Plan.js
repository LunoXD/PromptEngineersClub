import mongoose from 'mongoose';
import { planSchema } from '../schemas/planSchema.js';

export const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
