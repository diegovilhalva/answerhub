import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Tag from '../models/Tag.js';

// GET /questions?tag=&sort=recent|votes|unanswered&search=&page=&limit=
export async function listQuestions(req, res, next) {
  try {
    const { tag, sort = 'recent', search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (tag) filter.tags = tag.toLowerCase();
    if (search) filter.$text = { $search: search };
    if (sort === 'unanswered') filter.answerCount = 0;

    const sortMap = {
      recent: { createdAt: -1 },
      votes: { votes: -1 },
      unanswered: { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('author', 'name avatar reputation')
        .sort(sortMap[sort] || sortMap.recent)
        .skip(skip)
        .limit(Number(limit)),
      Question.countDocuments(filter),
    ]);

    res.json({ questions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

// GET /questions/:id
export async function getQuestion(req, res, next) {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'name avatar reputation');

    if (!question) return res.status(404).json({ message: 'Question not found' });

    const answers = await Answer.find({ question: question._id })
      .populate('author', 'name avatar reputation')
      .sort({ isAccepted: -1, votes: -1, createdAt: 1 });

    res.json({ question, answers });
  } catch (error) {
    next(error);
  }
}

// POST /questions
export async function createQuestion(req, res, next) {
  try {
    const { title, body, tags = [] } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }


    const tagsArray = Array.isArray(tags) ? tags : String(tags).split(',');

    const normalizedTags = [
      ...new Set(tagsArray.map((t) => t.toLowerCase().trim()).filter(Boolean)),
    ].slice(0, 5);

    const question = await Question.create({
      title,
      body,
      tags: normalizedTags,
      author: req.user._id,
    });

    // Upsert tags and bump their question count
    await Promise.all(
      normalizedTags.map((name) =>
        Tag.findOneAndUpdate(
          { name },
          { $inc: { questionCount: 1 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
}

// PATCH /:id/Edit
export const editQuestion = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, body, tags = [] } = req.body

    const question = await Question.findOne({ _id: id, author: req.user._id })

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }



    const tagsArray = Array.isArray(tags) ? tags : String(tags).split(',');

    const normalizedTags = [
      ...new Set(tagsArray.map((t) => t.toLowerCase().trim()).filter(Boolean)),
    ].slice(0, 5);

    const newTags = normalizedTags.filter((t) => !question.tags.includes(t));
    await Promise.all(newTags.map((name) =>
      Tag.findOneAndUpdate({ name }, { $inc: { questionCount: 1 } }, { upsert: true })
    ));

    if (title !== undefined) question.title = title;
    if (body !== undefined) question.body = body;


    const totalTags = [...new Set([...question.tags, ...normalizedTags])];


    question.tags = totalTags.slice(0, 5);

    await question.save()

    res.json(question)
  } catch (error) {
    next(error);
  }
}

// PATCH /questions/:id/accept/:answerId
export async function acceptAnswer(req, res, next) {
  try {
    const { id, answerId } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    if (String(question.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the question author can accept an answer' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer || String(answer.question) !== String(id)) {
      return res.status(404).json({ message: 'Answer not found for this question' });
    }

    // Unset any previously accepted answer for this question
    await Answer.updateMany({ question: id }, { $set: { isAccepted: false } });
    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    res.json({ question, answer });
  } catch (error) {
    next(error);
  }
}