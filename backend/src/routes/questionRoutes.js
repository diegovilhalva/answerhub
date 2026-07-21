import { Router } from 'express';
import {
  listQuestions,
  getQuestion,
  createQuestion,
  acceptAnswer,
  editQuestion,
} from '../controllers/questionController.js';
import { createAnswer } from '../controllers/answerController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', listQuestions);
router.get('/:id', optionalAuth, getQuestion);
router.post('/', protect, createQuestion);
router.patch("/:id/edit", protect, editQuestion)
router.post('/:id/answers', protect, createAnswer);
router.patch('/:id/accept/:answerId', protect, acceptAnswer);

export default router;
