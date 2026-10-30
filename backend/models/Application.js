import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
      required: true
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
      index: true
    },
    externalJobId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: '' },
    jobUrl: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
      default: 'saved'
    },
    notes: { type: String, trim: true, default: '' },
    timeline: { type: [timelineEntrySchema], default: [] }
  },
  { timestamps: true }
);

applicationSchema.index({ createdBy: 1, externalJobId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
