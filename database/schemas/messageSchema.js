import mongoose from 'mongoose';

const messageReactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true, trim: true, maxlength: 16 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: false }
);

export const messageSchema = new mongoose.Schema(
  {
    serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatServer', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    editedAt: { type: Date },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: { type: [messageReactionSchema], default: [] },
  },
  { timestamps: true }
);
