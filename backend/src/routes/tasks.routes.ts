import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

// GET /api/tasks
router.get('/', (req, res, next) => {
  try {
    const { status, priority } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: unknown[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY due_date ASC, created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
router.get('/:id', (req, res, next) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

    if (!task) {
      next(new ApiError(404, 'Task not found'));
      return;
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
router.post('/', validate(createTaskSchema), (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO tasks (id, title, description, priority, status, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, title, description || null, priority, status, dueDate || null);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id
router.put('/:id', validate(updateTaskSchema), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

    if (!existing) {
      next(new ApiError(404, 'Task not found'));
      return;
    }

    const fieldMap: Record<string, string> = {
      dueDate: 'due_date',
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
      db.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res, next) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

    if (!task) {
      next(new ApiError(404, 'Task not found'));
      return;
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
