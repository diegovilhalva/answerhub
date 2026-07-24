import { Router } from 'express';
import { deleteAnswer } from '../controllers/answerController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.delete('/:id', protect, deleteAnswer);

export default router;
