import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';
import { Category } from '../types';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#8B5CF6'),
});

const updateCategorySchema = createCategorySchema.partial();

// GET /api/categories
router.get('/', (req, res, next) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id
router.get('/:id', (req, res, next) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);

    if (!category) {
      next(new ApiError(404, 'Category not found'));
      return;
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// POST /api/categories
router.post('/', validate(createCategorySchema), (req, res, next) => {
  try {
    const { name, color } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO categories (id, name, color, book_count)
      VALUES (?, ?, ?, 0)
    `).run(id, name, color);

    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id
router.put('/:id', validate(updateCategorySchema), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);

    if (!existing) {
      next(new ApiError(404, 'Category not found'));
      return;
    }

    const { name, color } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }

    if (updates.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res, next) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as Category | undefined;

    if (!category) {
      next(new ApiError(404, 'Category not found'));
      return;
    }

    // Check for books in category
    if (category.book_count > 0) {
      next(new ApiError(400, 'Cannot delete category with books. Move or delete books first.'));
      return;
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
