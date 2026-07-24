import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    votes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

answerSchema.index({ question: 1, createdAt: -1 });

export default mongoose.model('Answer', answerSchema);