import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    googleId: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);
