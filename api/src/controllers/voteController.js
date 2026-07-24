import Vote from '../models/Vote.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import { REPUTATION_POINTS } from '../utils/reputation.js';

const MODEL_MAP = {
  question: { doc: Question, model: 'Question' },
  answer: { doc: Answer, model: 'Answer' },
};

// POST /votes  { targetType: 'question'|'answer', targetId, value: 1|-1 }
export async function castVote(req, res, next) {
  try {
    const { targetType, targetId, value } = req.body;

    if (!['question', 'answer'].includes(targetType) || ![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote payload' });
    }

    const { doc: TargetDoc, model } = MODEL_MAP[targetType];
    const target = await TargetDoc.findById(targetId);
    if (!target) return res.status(404).json({ message: `${targetType} not found` });

    if (String(target.author) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot vote on your own content' });
    }

    const existing = await Vote.findOne({ user: req.user._id, target: targetId });

    let voteDelta = 0;
    let repDelta = 0;
    const upPoints =
      targetType === 'question' ? REPUTATION_POINTS.QUESTION_UPVOTE : REPUTATION_POINTS.ANSWER_UPVOTE;
    const downPoints =
      targetType === 'question' ? REPUTATION_POINTS.QUESTION_DOWNVOTE : REPUTATION_POINTS.ANSWER_DOWNVOTE;

    if (existing && existing.value === value) {
      // Same vote again: retract it
      await existing.deleteOne();
      voteDelta = -value;
      repDelta = value === 1 ? -upPoints : -downPoints;
    } else if (existing) {
      // Switching vote direction
      existing.value = value;
      await existing.save();
      voteDelta = value * 2;
      repDelta = value === 1 ? upPoints - downPoints : downPoints - upPoints;
    } else {
      // New vote
      await Vote.create({
        user: req.user._id,
        targetType,
        target: targetId,
        targetModel: model,
        value,
      });
      voteDelta = value;
      repDelta = value === 1 ? upPoints : downPoints;
    }

    target.votes += voteDelta;
    await target.save();
    await User.findByIdAndUpdate(target.author, { $inc: { reputation: repDelta } });

    res.json({ votes: target.votes });
  } catch (error) {
    next(error);
  }
}
