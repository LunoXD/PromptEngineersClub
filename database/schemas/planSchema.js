import mongoose from 'mongoose';

export const planSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    attendees: { type: Number, default: 0 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['upcoming', 'recurring'],
      default: 'upcoming',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
