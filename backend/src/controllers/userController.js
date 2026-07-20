import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

export async function getUserProfile(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [questions, answers] = await Promise.all([
      Question.find({ author: user._id }).sort({ createdAt: -1 }).limit(10),
      Answer.find({ author: user._id }).sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({ user, questions, answers });
  } catch (error) {
    next(error);
  }
}
