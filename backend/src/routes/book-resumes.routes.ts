import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

const createResumeSchema = z.object({
  participantId: z.string().uuid(),
  bookId: z.string().uuid(),
  summaryText: z.string().trim().max(5000).optional(),
  learningNotes: z.string().trim().max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

// GET /api/book-resumes
router.get('/', (req, res, next) => {
  try {
    const { participantId, bookId, status, page = '1', pageSize = '50' } = req.query;

    let query = `
      SELECT br.*, 
        p.first_name || ' ' || p.last_name as participant_name,
        b.title as book_title, b.author as book_author
      FROM book_resumes br
      JOIN participants p ON br.participant_id = p.id
      JOIN books b ON br.book_id = b.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM book_resumes WHERE 1=1';
    const params: unknown[] = [];

    if (participantId) {
      query += ' AND br.participant_id = ?';
      countQuery += ' AND participant_id = ?';
      params.push(participantId);
    }

    if (bookId) {
      query += ' AND br.book_id = ?';
      countQuery += ' AND book_id = ?';
      params.push(bookId);
    }

    if (status) {
      query += ' AND br.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
    }

    const { total } = db.prepare(countQuery).get(...params) as { total: number };

    const pageNum = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * size;

    query += ' ORDER BY br.date DESC LIMIT ? OFFSET ?';

    const resumes = db.prepare(query).all(...params, size, offset);

    res.json({
      data: resumes,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/book-resumes/:id
router.get('/:id', (req, res, next) => {
  try {
    const resume = db.prepare(`
      SELECT br.*, 
        p.first_name || ' ' || p.last_name as participant_name,
        b.title as book_title, b.author as book_author
      FROM book_resumes br
      JOIN participants p ON br.participant_id = p.id
      JOIN books b ON br.book_id = b.id
      WHERE br.id = ?
    `).get(req.params.id);

    if (!resume) {
      next(new ApiError(404, 'Book resume not found'));
      return;
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
});

// POST /api/book-resumes
router.post('/', validate(createResumeSchema), (req, res, next) => {
  try {
    const { participantId, bookId, summaryText, learningNotes, rating } = req.body;

    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(participantId) as any;
    if (!participant) {
      next(new ApiError(404, 'Participant not found'));
      return;
    }

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    if (!book) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    const id = crypto.randomUUID();
    const date = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO book_resumes (id, participant_id, participant_number, book_id, date, status, summary_text, learning_notes, rating)
      VALUES (?, ?, ?, ?, ?, 'generated', ?, ?, ?)
    `).run(id, participantId, participant.number, bookId, date, summaryText || null, learningNotes || null, rating || null);

    const newResume = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(id);
    res.status(201).json(newResume);
  } catch (error) {
    next(error);
  }
});

// PUT /api/book-resumes/:id
router.put('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Book resume not found'));
      return;
    }

    const fieldMap: Record<string, string> = {
      summaryText: 'summary_text',
      learningNotes: 'learning_notes',
      reviewerNotes: 'reviewer_notes',
      reviewedAt: 'reviewed_at',
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
      db.prepare(`UPDATE book_resumes SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// PUT /api/book-resumes/:id/submit
router.put('/:id/submit', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Book resume not found'));
      return;
    }

    db.prepare(`UPDATE book_resumes SET status = 'submitted' WHERE id = ?`).run(req.params.id);

    const updated = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// PUT /api/book-resumes/:id/review
router.put('/:id/review', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Book resume not found'));
      return;
    }

    const { reviewerNotes } = req.body;

    db.prepare(`
      UPDATE book_resumes 
      SET status = 'reviewed', reviewer_notes = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `).run(reviewerNotes || null, req.params.id);

    const updated = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/book-resumes/:id
router.delete('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM book_resumes WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Book resume not found'));
      return;
    }

    db.prepare('DELETE FROM book_resumes WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
