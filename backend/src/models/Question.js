import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    votes: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null },
  },
  { timestamps: true }
);


questionSchema.index({ title: 'text', body: 'text' });

questionSchema.index({ createdAt: -1 });
questionSchema.index({ votes: -1 });
questionSchema.index({ tags: 1 });

export default mongoose.model('Question', questionSchema);