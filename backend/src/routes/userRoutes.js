import { Router } from 'express';
import { getUserProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/upload.js';

const router = Router();


router.patch('/me', protect, uploadAvatar, updateProfile);
router.get('/:id', getUserProfile);

export default router;