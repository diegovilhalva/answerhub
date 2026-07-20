import Tag from '../models/Tag.js';

export async function listTags(req, res, next) {
  try {
    const tags = await Tag.find().sort({ questionCount: -1 });
    res.json(tags);
  } catch (error) {
    next(error);
  }
}
