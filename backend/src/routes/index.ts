import { Router } from 'express';

import authRoutes from './auth.routes';
import booksRoutes from './books.routes';
import categoriesRoutes from './categories.routes';
import loansRoutes from './loans.routes';
import participantsRoutes from './participants.routes';
import classesRoutes from './classes.routes';
import tasksRoutes from './tasks.routes';
import configRoutes from './config.routes';
import materialsRoutes from './materials.routes';
import inventoryRoutes from './inventory.routes';
import readingSessionsRoutes from './reading-sessions.routes';
import bookIssuesRoutes from './book-issues.routes';
import reportsRoutes from './reports.routes';
import otherReadersRoutes from './other-readers.routes';
import extraActivitiesRoutes from './extra-activities.routes';
import bookResumesRoutes from './book-resumes.routes';
import auditLogRoutes from './audit-log.routes';

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
router.use('/materials', materialsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reading-sessions', readingSessionsRoutes);
router.use('/book-issues', bookIssuesRoutes);
router.use('/reports', reportsRoutes);
router.use('/other-readers', otherReadersRoutes);
router.use('/extra-activities', extraActivitiesRoutes);
router.use('/book-resumes', bookResumesRoutes);
router.use('/audit-log', auditLogRoutes);

export default router;
