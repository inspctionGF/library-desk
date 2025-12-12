import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// Validation schemas
const createClassSchema = z.object({
  name: z.string().trim().min(1).max(100),
  ageRange: z.enum(['3-5', '6-8', '9-11', '12-14', '15-18', '19-22']),
  monitorName: z.string().trim().max(100).optional(),
});

const updateClassSchema = createClassSchema.partial();

// GET /api/classes
router.get('/', (req, res, next) => {
  try {
    const classes = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM participants WHERE class_id = c.id) as participant_count
      FROM classes c
      ORDER BY c.name ASC
    `).all();

    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/:id
router.get('/:id', (req, res, next) => {
  try {
    const cls = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM participants WHERE class_id = c.id) as participant_count
      FROM classes c
      WHERE c.id = ?
    `).get(req.params.id);

    if (!cls) {
      next(new ApiError(404, 'Class not found'));
      return;
    }

    res.json(cls);
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/:id/participants
router.get('/:id/participants', (req, res, next) => {
  try {
    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);

    if (!cls) {
      next(new ApiError(404, 'Class not found'));
      return;
    }

    const participants = db.prepare(`
      SELECT * FROM participants WHERE class_id = ?
      ORDER BY last_name, first_name
    `).all(req.params.id);

    res.json(participants);
  } catch (error) {
    next(error);
  }
});

// POST /api/classes
router.post('/', validate(createClassSchema), (req, res, next) => {
  try {
    const { name, ageRange, monitorName } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO classes (id, name, age_range, monitor_name)
      VALUES (?, ?, ?, ?)
    `).run(id, name, ageRange, monitorName || null);

    const newClass = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
});

// PUT /api/classes/:id
router.put('/:id', validate(updateClassSchema), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);

    if (!existing) {
      next(new ApiError(404, 'Class not found'));
      return;
    }

    const { name, ageRange, monitorName } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (ageRange !== undefined) {
      updates.push('age_range = ?');
      values.push(ageRange);
    }
    if (monitorName !== undefined) {
      updates.push('monitor_name = ?');
      values.push(monitorName);
    }

    if (updates.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE classes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/classes/:id
router.delete('/:id', (req, res, next) => {
  try {
    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);

    if (!cls) {
      next(new ApiError(404, 'Class not found'));
      return;
    }

    // Check for participants
    const participantCount = db.prepare('SELECT COUNT(*) as count FROM participants WHERE class_id = ?')
      .get(req.params.id) as { count: number };

    if (participantCount.count > 0) {
      next(new ApiError(400, 'Cannot delete class with participants. Transfer them first.'));
      return;
    }

    db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
