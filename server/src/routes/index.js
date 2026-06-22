import { Router } from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
// Future routes — uncomment as you build each day
// import postRoutes from './postRoutes.js';
// import commentRoutes from './commentRoutes.js';
// import reactionRoutes from './reactionRoutes.js';
// import connectionRoutes from './connectionRoutes.js';
// import notificationRoutes from './notificationRoutes.js';
// import categoryRoutes from './categoryRoutes.js';
// import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
// router.use('/posts', postRoutes);
// router.use('/comments', commentRoutes);
// router.use('/reactions', reactionRoutes);
// router.use('/connections', connectionRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/admin', adminRoutes);

export default router;
