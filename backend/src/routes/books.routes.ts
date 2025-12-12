import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';
import { Book } from '../types';

const router = Router();

// Validation schemas
const createBookSchema = z.object({
  title: z.string().trim().min(1).max(255),
  author: z.string().trim().min(1).max(255),
  isbn: z.string().trim().max(20).optional(),
  categoryId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).default(1),
  coverUrl: z.string().url().max(500).optional(),
});

const updateBookSchema = createBookSchema.partial();

const querySchema = z.object({
  category: z.string().optional(),
  available: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// GET /api/books
router.get('/', (req, res, next) => {
  try {
    const { category, available, search, page = '1', pageSize = '50' } = req.query;

    let query = 'SELECT * FROM books WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE 1=1';
    const params: unknown[] = [];

    if (category) {
      query += ' AND category_id = ?';
      countQuery += ' AND category_id = ?';
      params.push(category);
    }

    if (available === 'true') {
      query += ' AND available_copies > 0';
      countQuery += ' AND available_copies > 0';
    } else if (available === 'false') {
      query += ' AND available_copies = 0';
      countQuery += ' AND available_copies = 0';
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      countQuery += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const { total } = db.prepare(countQuery).get(...params) as { total: number };

    // Add pagination
    const pageNum = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * size;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const books = db.prepare(query).all(...params, size, offset);

    res.json({
      data: books,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id
router.get('/:id', (req, res, next) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id) as Book | undefined;

    if (!book) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
});

// POST /api/books
router.post('/', validate(createBookSchema), (req, res, next) => {
  try {
    const { title, author, isbn, categoryId, quantity, coverUrl } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO books (id, title, author, isbn, category_id, quantity, available_copies, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, author, isbn || null, categoryId || null, quantity, quantity, coverUrl || null);

    // Update category book count
    if (categoryId) {
      db.prepare('UPDATE categories SET book_count = book_count + 1 WHERE id = ?').run(categoryId);
    }

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'CREATE', 'books', ?, 'book', ?)
    `).run(crypto.randomUUID(), id, JSON.stringify({ title, author }));

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
});

// PUT /api/books/:id
router.put('/:id', validate(updateBookSchema), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id) as Book | undefined;

    if (!existing) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    const updates = req.body;
    const allowedFields = ['title', 'author', 'isbn', 'category_id', 'quantity', 'available_copies', 'cover_url'];
    
    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      categoryId: 'category_id',
      coverUrl: 'cover_url',
      availableCopies: 'available_copies',
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE books SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

      // Log audit
      db.prepare(`
        INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
        VALUES (?, datetime('now'), 'UPDATE', 'books', ?, 'book', ?)
      `).run(crypto.randomUUID(), req.params.id, JSON.stringify(updates));
    }

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/books/:id
router.delete('/:id', (req, res, next) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id) as Book | undefined;

    if (!book) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    // Check for active loans
    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM loans 
      WHERE book_id = ? AND status != 'returned'
    `).get(req.params.id) as { count: number };

    if (activeLoans.count > 0) {
      next(new ApiError(400, 'Cannot delete book with active loans'));
      return;
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);

    // Update category count
    if (book.category_id) {
      db.prepare('UPDATE categories SET book_count = book_count - 1 WHERE id = ?').run(book.category_id);
    }

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'DELETE', 'books', ?, 'book', ?)
    `).run(crypto.randomUUID(), req.params.id, JSON.stringify({ title: book.title }));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
