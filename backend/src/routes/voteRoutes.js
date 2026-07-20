import { Router } from 'express';
import { castVote } from '../controllers/voteController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/', protect, castVote);

export default router;
