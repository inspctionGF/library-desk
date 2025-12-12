import { Router } from 'express';

import authRoutes from './auth.routes';
import booksRoutes from './books.routes';
import categoriesRoutes from './categories.routes';
import loansRoutes from './loans.routes';
import participantsRoutes from './participants.routes';
import classesRoutes from './classes.routes';
import tasksRoutes from './tasks.routes';
import configRoutes from './config.routes';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/books', booksRoutes);
router.use('/categories', categoriesRoutes);
router.use('/loans', loansRoutes);
router.use('/participants', participantsRoutes);
router.use('/classes', classesRoutes);
router.use('/tasks', tasksRoutes);
router.use('/config', configRoutes);

export default router;
