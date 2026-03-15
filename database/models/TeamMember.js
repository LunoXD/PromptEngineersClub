import mongoose from 'mongoose';
import { teamMemberSchema } from '../schemas/teamMemberSchema.js';

export const TeamMember =
  mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);
