import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// ============ EXTRA ACTIVITY TYPES ============

const createTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#F97316'),
  description: z.string().trim().max(500).optional(),
});

// GET /api/extra-activities/types
router.get('/types', (req, res, next) => {
  try {
    const types = db.prepare('SELECT * FROM extra_activity_types ORDER BY name ASC').all();
    res.json(types);
  } catch (error) {
    next(error);
  }
});

// POST /api/extra-activities/types
router.post('/types', validate(createTypeSchema), (req, res, next) => {
  try {
    const { name, color, description } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO extra_activity_types (id, name, color, description)
      VALUES (?, ?, ?, ?)
    `).run(id, name, color, description || null);

    const newType = db.prepare('SELECT * FROM extra_activity_types WHERE id = ?').get(id);
    res.status(201).json(newType);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/extra-activities/types/:id
router.delete('/types/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM extra_activity_types WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Activity type not found'));
      return;
    }

    db.prepare('DELETE FROM extra_activity_types WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============ EXTRA ACTIVITIES ============

const createActivitySchema = z.object({
  typeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  memo: z.string().trim().max(2000).optional(),
});

// GET /api/extra-activities
router.get('/', (req, res, next) => {
  try {
    const { typeId, startDate, endDate } = req.query;

    let query = `
      SELECT ea.*, eat.name as type_name, eat.color as type_color
      FROM extra_activities ea
      LEFT JOIN extra_activity_types eat ON ea.type_id = eat.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (typeId) {
      query += ' AND ea.type_id = ?';
      params.push(typeId);
    }

    if (startDate) {
      query += ' AND ea.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND ea.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY ea.date DESC';

    const activities = db.prepare(query).all(...params);
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// GET /api/extra-activities/:id
router.get('/:id', (req, res, next) => {
  try {
    if (req.params.id === 'types') {
      next();
      return;
    }

    const activity = db.prepare(`
      SELECT ea.*, eat.name as type_name, eat.color as type_color
      FROM extra_activities ea
      LEFT JOIN extra_activity_types eat ON ea.type_id = eat.id
      WHERE ea.id = ?
    `).get(req.params.id);

    if (!activity) {
      next(new ApiError(404, 'Activity not found'));
      return;
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// POST /api/extra-activities
router.post('/', validate(createActivitySchema), (req, res, next) => {
  try {
    const { typeId, date, memo } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO extra_activities (id, type_id, date, memo)
      VALUES (?, ?, ?, ?)
    `).run(id, typeId, date, memo || null);

    const newActivity = db.prepare(`
      SELECT ea.*, eat.name as type_name, eat.color as type_color
      FROM extra_activities ea
      LEFT JOIN extra_activity_types eat ON ea.type_id = eat.id
      WHERE ea.id = ?
    `).get(id);

    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
});

// PUT /api/extra-activities/:id
router.put('/:id', validate(createActivitySchema.partial()), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM extra_activities WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Activity not found'));
      return;
    }

    const fieldMap: Record<string, string> = {
      typeId: 'type_id',
    };

    const updates = req.body;
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      setClauses.push(`${dbField} = ?`);
      values.push(value);
    }

    if (setClauses.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE extra_activities SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM extra_activities WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/extra-activities/:id
router.delete('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM extra_activities WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Activity not found'));
      return;
    }

    db.prepare('DELETE FROM extra_activities WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
