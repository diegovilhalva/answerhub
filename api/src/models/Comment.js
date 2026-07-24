import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    parentType: { type: String, enum: ['question', 'answer'], required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'parentModel' },
    parentModel: { type: String, required: true, enum: ['Question', 'Answer'] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

commentSchema.index({ parent: 1, createdAt: 1 });

export default mongoose.model('Comment', commentSchema);