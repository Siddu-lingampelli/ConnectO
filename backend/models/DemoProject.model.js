import mongoose from 'mongoose';

const DemoProjectSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerType: { type: String, enum: ['Technical', 'Non-Technical'], required: true },
  demoTitle: { type: String, required: true },
  description: { type: String, required: true },
  submissionLink: { type: String },
  submissionFile: { type: String }, // file path or URL
  score: { type: Number, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  adminComments: { type: String },
  dateAssigned: { type: Date, default: Date.now },
  dateSubmitted: { type: Date },
  dateReviewed: { type: Date },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who reviewed
  activityLog: [
    {
      action: String,
      date: { type: Date, default: Date.now },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      details: String,
    },
  ],
});

const DemoProject = mongoose.model('DemoProject', DemoProjectSchema);

export default DemoProject;
