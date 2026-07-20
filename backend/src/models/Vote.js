import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['question', 'answer'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
    targetModel: { type: String, required: true, enum: ['Question', 'Answer'] },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);


voteSchema.index({ user: 1, target: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);