import mongoose from 'mongoose';

const statSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const featureSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'Lightbulb' },
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    cta: { type: String, default: '' },
  },
  { _id: false }
);

export const homeContentSchema = new mongoose.Schema(
  {
    heroBadge: { type: String, default: '' },
    heroDescription: { type: String, default: '' },
    stats: { type: [statSchema], default: [] },
    features: { type: [featureSchema], default: [] },
  },
  { timestamps: true }
);
