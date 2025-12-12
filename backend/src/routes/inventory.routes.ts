import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// ============ INVENTORY SESSIONS ============

const createSessionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sessionType: z.enum(['annual', 'quarterly', 'adhoc']).default('annual'),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/inventory
router.get('/', (req, res, next) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM inventory_sessions WHERE 1=1';
    const params: unknown[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const sessions = db.prepare(query).all(...params);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/:id
router.get('/:id', (req, res, next) => {
  try {
    const session = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      next(new ApiError(404, 'Inventory session not found'));
      return;
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/:id/items
router.get('/:id/items', (req, res, next) => {
  try {
    const session = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      next(new ApiError(404, 'Inventory session not found'));
      return;
    }

    const items = db.prepare(`
      SELECT ii.*, b.title as book_title, b.author as book_author, c.name as category_name
      FROM inventory_items ii
      JOIN books b ON ii.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ii.session_id = ?
      ORDER BY b.title ASC
    `).all(req.params.id);

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory - Start new inventory session
router.post('/', validate(createSessionSchema), (req, res, next) => {
  try {
    const { name, sessionType, notes } = req.body;
    const id = crypto.randomUUID();

    // Get all books
    const books = db.prepare('SELECT id, quantity FROM books').all() as { id: string; quantity: number }[];

    db.prepare(`
      INSERT INTO inventory_sessions (id, name, session_type, status, total_books, notes)
      VALUES (?, ?, ?, 'in_progress', ?, ?)
    `).run(id, name, sessionType, books.length, notes || null);

    // Create inventory items for all books
    const insertItem = db.prepare(`
      INSERT INTO inventory_items (id, session_id, book_id, expected_quantity, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    const transaction = db.transaction(() => {
      for (const book of books) {
        insertItem.run(crypto.randomUUID(), id, book.id, book.quantity);
      }
    });
    transaction();

    const newSession = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(id);
    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
});

// PUT /api/inventory/:id/items/:itemId - Check inventory item
router.put('/:id/items/:itemId', (req, res, next) => {
  try {
    const item = db.prepare('SELECT * FROM inventory_items WHERE id = ? AND session_id = ?')
      .get(req.params.itemId, req.params.id);

    if (!item) {
      next(new ApiError(404, 'Inventory item not found'));
      return;
    }

    const { foundQuantity, notes } = req.body;
    const expectedQuantity = (item as any).expected_quantity;
    const status = foundQuantity === expectedQuantity ? 'checked' : 'discrepancy';

    db.prepare(`
      UPDATE inventory_items 
      SET found_quantity = ?, status = ?, notes = ?, checked_at = datetime('now')
      WHERE id = ?
    `).run(foundQuantity, status, notes || null, req.params.itemId);

    // Update session counts
    const checkedCount = db.prepare(`
      SELECT COUNT(*) as count FROM inventory_items 
      WHERE session_id = ? AND status != 'pending'
    `).get(req.params.id) as { count: number };

    const discrepancyCount = db.prepare(`
      SELECT COUNT(*) as count FROM inventory_items 
      WHERE session_id = ? AND status = 'discrepancy'
    `).get(req.params.id) as { count: number };

    db.prepare(`
      UPDATE inventory_sessions 
      SET checked_books = ?, discrepancy_count = ?
      WHERE id = ?
    `).run(checkedCount.count, discrepancyCount.count, req.params.id);

    const updated = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.itemId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/:id/complete - Complete inventory session
router.post('/:id/complete', (req, res, next) => {
  try {
    const session = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) {
      next(new ApiError(404, 'Inventory session not found'));
      return;
    }

    if (session.status === 'completed') {
      next(new ApiError(400, 'Session already completed'));
      return;
    }

    db.prepare(`
      UPDATE inventory_sessions 
      SET status = 'completed', end_date = date('now')
      WHERE id = ?
    `).run(req.params.id);

    const updated = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/:id/cancel - Cancel inventory session
router.post('/:id/cancel', (req, res, next) => {
  try {
    const session = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) {
      next(new ApiError(404, 'Inventory session not found'));
      return;
    }

    if (session.status !== 'in_progress') {
      next(new ApiError(400, 'Can only cancel in-progress sessions'));
      return;
    }

    db.prepare(`UPDATE inventory_sessions SET status = 'cancelled' WHERE id = ?`).run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', (req, res, next) => {
  try {
    const session = db.prepare('SELECT * FROM inventory_sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      next(new ApiError(404, 'Inventory session not found'));
      return;
    }

    db.prepare('DELETE FROM inventory_items WHERE session_id = ?').run(req.params.id);
    db.prepare('DELETE FROM inventory_sessions WHERE id = ?').run(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
