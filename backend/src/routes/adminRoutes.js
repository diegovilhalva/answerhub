import { Router } from 'express';
import {
  listUsers,
  updateUserRole,
  deleteUser,
  deleteQuestionAsModerator,
  deleteAnswerAsModerator,
  getStats,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

// User management: admin only
router.get('/users', authorize('admin'), listUsers);
router.patch('/users/:id/role', authorize('admin'), updateUserRole);
router.delete('/users/:id', authorize('admin'), deleteUser);

// Content moderation: moderator or admin
router.delete('/questions/:id', authorize('admin', 'moderator'), deleteQuestionAsModerator);
router.delete('/answers/:id', authorize('admin', 'moderator'), deleteAnswerAsModerator);

// Dashboard stats: moderator or admin
router.get('/stats', authorize('admin', 'moderator'), getStats);

export default router;