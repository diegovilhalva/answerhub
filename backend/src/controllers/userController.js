import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { uploadBufferToCloudinary } from '../utils/uploadBufferToCloudinary.js';

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

// PATCH /users/me — name, bio and/or avatar (multipart/form-data, field "avatar")
export async function updateProfile(req, res, next) {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        public_id: `user_${user._id}`,
        overwrite: true,
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
      });
      user.avatar = result.secure_url;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
}