import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// Validation schemas
const createOtherReaderSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  readerType: z.enum(['parent', 'instructor', 'staff', 'other']),
  phone: z.string().trim().max(20).optional(),
  email: z.string().email().max(255).optional(),
  notes: z.string().trim().max(1000).optional(),
});

// Helper: Generate reader number
function generateReaderNumber(): string {
  const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('cdejNumber') as { value: string } | undefined;
  const cdej = config?.value || '0000';

  const result = db.prepare(`
    SELECT number FROM other_readers 
    WHERE number LIKE 'HA-' || ? || '-L-%'
    ORDER BY number DESC LIMIT 1
  `).get(cdej) as { number: string } | undefined;

  let nextNum = 1;
  if (result) {
    const parts = result.number.split('-');
    const lastNum = parseInt(parts[3], 10);
    nextNum = lastNum + 1;
  }

  return `HA-${cdej}-L-${nextNum.toString().padStart(5, '0')}`;
}

// GET /api/other-readers
router.get('/', (req, res, next) => {
  try {
    const { readerType, search } = req.query;

    let query = 'SELECT * FROM other_readers WHERE 1=1';
    const params: unknown[] = [];

    if (readerType) {
      query += ' AND reader_type = ?';
      params.push(readerType);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY last_name, first_name';

    const readers = db.prepare(query).all(...params);
    res.json(readers);
  } catch (error) {
    next(error);
  }
});

// GET /api/other-readers/:id
router.get('/:id', (req, res, next) => {
  try {
    const reader = db.prepare('SELECT * FROM other_readers WHERE id = ?').get(req.params.id);
    if (!reader) {
      next(new ApiError(404, 'Other reader not found'));
      return;
    }
    res.json(reader);
  } catch (error) {
    next(error);
  }
});

// GET /api/other-readers/:id/journal
router.get('/:id/journal', (req, res, next) => {
  try {
    const reader = db.prepare('SELECT * FROM other_readers WHERE id = ?').get(req.params.id);
    if (!reader) {
      next(new ApiError(404, 'Other reader not found'));
      return;
    }

    const loans = db.prepare(`
      SELECT l.*, b.title as book_title, b.author as book_author
      FROM loans l
      JOIN books b ON l.book_id = b.id
      WHERE l.borrower_id = ? AND l.borrower_type = 'other_reader'
      ORDER BY l.loan_date DESC
    `).all(req.params.id);

    res.json({
      reader,
      loans,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/other-readers
router.post('/', validate(createOtherReaderSchema), (req, res, next) => {
  try {
    const { firstName, lastName, readerType, phone, email, notes } = req.body;
    const id = crypto.randomUUID();
    const number = generateReaderNumber();

    db.prepare(`
      INSERT INTO other_readers (id, number, first_name, last_name, reader_type, phone, email, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, number, firstName, lastName, readerType, phone || null, email || null, notes || null);

    const newReader = db.prepare('SELECT * FROM other_readers WHERE id = ?').get(id);
    res.status(201).json(newReader);
  } catch (error) {
    next(error);
  }
});

// PUT /api/other-readers/:id
router.put('/:id', validate(createOtherReaderSchema.partial()), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM other_readers WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Other reader not found'));
      return;
    }

    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      readerType: 'reader_type',
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
      db.prepare(`UPDATE other_readers SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM other_readers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/other-readers/:id
router.delete('/:id', (req, res, next) => {
  try {
    const reader = db.prepare('SELECT * FROM other_readers WHERE id = ?').get(req.params.id);
    if (!reader) {
      next(new ApiError(404, 'Other reader not found'));
      return;
    }

    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM loans 
      WHERE borrower_id = ? AND borrower_type = 'other_reader' AND status != 'returned'
    `).get(req.params.id) as { count: number };

    if (activeLoans.count > 0) {
      next(new ApiError(400, 'Cannot delete reader with active loans'));
      return;
    }

    db.prepare('DELETE FROM other_readers WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
