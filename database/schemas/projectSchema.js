import mongoose from 'mongoose';

export const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    link: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Planning'],
      default: 'Planning',
    },
  },
  { timestamps: true }
);
