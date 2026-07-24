import Answer from '../models/Answer.js';
import Question from '../models/Question.js';

// POST /questions/:id/answers
export async function createAnswer(req, res, next) {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: 'Answer body is required' });

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const answer = await Answer.create({
      question: question._id,
      author: req.user._id,
      body,
    });

    question.answerCount += 1;
    await question.save();

    const populated = await answer.populate('author', 'name avatar reputation');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
}

// DELETE /answers/:id (author or moderator/admin only)
export async function deleteAnswer(req, res, next) {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    const isOwner = String(answer.author) === String(req.user._id);
    const isPrivileged = ['moderator', 'admin'].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    await answer.deleteOne();
    await Question.findByIdAndUpdate(answer.question, { $inc: { answerCount: -1 } });

    res.json({ message: 'Answer deleted' });
  } catch (error) {
    next(error);
  }
}
