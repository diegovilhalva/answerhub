import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Tag from '../models/Tag.js';

const VALID_ROLES = ['user', 'moderator', 'admin'];

// GET /admin/users?page=&limit=&search=
export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/users/:id/role   { role: 'user'|'moderator'|'admin' }
export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

// DELETE /admin/users/:id
export async function deleteUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Note: their questions/answers/votes are kept for thread integrity,
    // just orphaned from a deleted author. A soft-delete/anonymize flag
    // would be a cleaner long-term approach if this becomes an issue.

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}

// DELETE /admin/questions/:id  (moderation — no ownership check)
export async function deleteQuestionAsModerator(req, res, next) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await Answer.deleteMany({ question: question._id });

    if (question.tags?.length) {
      await Tag.updateMany(
        { name: { $in: question.tags } },
        { $inc: { questionCount: -1 } }
      );
    }

    res.json({ message: 'Question and its answers deleted' });
  } catch (error) {
    next(error);
  }
}

// DELETE /admin/answers/:id  (moderation — no ownership check)
export async function deleteAnswerAsModerator(req, res, next) {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    await Question.findByIdAndUpdate(answer.question, { $inc: { answerCount: -1 } });

    res.json({ message: 'Answer deleted' });
  } catch (error) {
    next(error);
  }
}

// GET /admin/stats
export async function getStats(req, res, next) {
  try {
    const [userCount, questionCount, answerCount, unansweredCount, topTags] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      Question.countDocuments({ answerCount: 0 }),
      Tag.find().sort({ questionCount: -1 }).limit(5),
    ]);

    res.json({
      users: userCount,
      questions: questionCount,
      answers: answerCount,
      unansweredQuestions: unansweredCount,
      topTags,
    });
  } catch (error) {
    next(error);
  }
}