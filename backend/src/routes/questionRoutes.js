import { Router } from 'express';
import {
  listQuestions,
  getQuestion,
  createQuestion,
  acceptAnswer,
} from '../controllers/questionController.js';
import { createAnswer } from '../controllers/answerController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', listQuestions);
router.get('/:id', optionalAuth, getQuestion);
router.post('/', protect, createQuestion);
router.post('/:id/answers', protect, createAnswer);
router.patch('/:id/accept/:answerId', protect, acceptAnswer);

export default router;
