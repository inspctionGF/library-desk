import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// ============ BOOK ISSUES ============

const createIssueSchema = z.object({
  bookId: z.string().uuid(),
  issueType: z.enum(['not_returned', 'damaged', 'torn', 'lost']),
  quantity: z.number().int().min(1).default(1),
  borrowerName: z.string().trim().max(200).optional(),
  loanId: z.string().uuid().optional(),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/book-issues
router.get('/', (req, res, next) => {
  try {
    const { bookId, status, issueType } = req.query;

    let query = `
      SELECT bi.*, b.title as book_title, b.author as book_author
      FROM book_issues bi
      JOIN books b ON bi.book_id = b.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (bookId) {
      query += ' AND bi.book_id = ?';
      params.push(bookId);
    }

    if (status) {
      query += ' AND bi.status = ?';
      params.push(status);
    }

    if (issueType) {
      query += ' AND bi.issue_type = ?';
      params.push(issueType);
    }

    query += ' ORDER BY bi.report_date DESC';

    const issues = db.prepare(query).all(...params);
    res.json(issues);
  } catch (error) {
    next(error);
  }
});

// GET /api/book-issues/stats
router.get('/stats', (req, res, next) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM book_issues').get() as { count: number };
    const open = db.prepare(`SELECT COUNT(*) as count FROM book_issues WHERE status = 'open'`).get() as { count: number };
    const resolved = db.prepare(`SELECT COUNT(*) as count FROM book_issues WHERE status = 'resolved'`).get() as { count: number };
    const writtenOff = db.prepare(`SELECT COUNT(*) as count FROM book_issues WHERE status = 'written_off'`).get() as { count: number };

    const byType = db.prepare(`
      SELECT issue_type, COUNT(*) as count, SUM(quantity) as total_quantity
      FROM book_issues
      GROUP BY issue_type
    `).all();

    res.json({
      total: total.count,
      open: open.count,
      resolved: resolved.count,
      writtenOff: writtenOff.count,
      byType,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/book-issues
router.post('/', validate(createIssueSchema), (req, res, next) => {
  try {
    const { bookId, issueType, quantity, borrowerName, loanId, notes } = req.body;

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    if (!book) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    const id = crypto.randomUUID();
    const reportDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO book_issues (id, book_id, issue_type, quantity, borrower_name, loan_id, report_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
    `).run(id, bookId, issueType, quantity, borrowerName || null, loanId || null, reportDate);

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'CREATE', 'book_issues', ?, 'book_issue', ?)
    `).run(crypto.randomUUID(), id, JSON.stringify({ bookId, issueType, quantity }));

    const newIssue = db.prepare(`
      SELECT bi.*, b.title as book_title
      FROM book_issues bi
      JOIN books b ON bi.book_id = b.id
      WHERE bi.id = ?
    `).get(id);

    res.status(201).json(newIssue);
  } catch (error) {
    next(error);
  }
});

// PUT /api/book-issues/:id/resolve
router.put('/:id/resolve', (req, res, next) => {
  try {
    const issue = db.prepare('SELECT * FROM book_issues WHERE id = ?').get(req.params.id);
    if (!issue) {
      next(new ApiError(404, 'Book issue not found'));
      return;
    }

    const { resolutionNotes, status } = req.body;
    const finalStatus = status || 'resolved';

    db.prepare(`
      UPDATE book_issues 
      SET status = ?, resolution_notes = ?, resolved_at = datetime('now')
      WHERE id = ?
    `).run(finalStatus, resolutionNotes || null, req.params.id);

    const updated = db.prepare('SELECT * FROM book_issues WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/book-issues/:id
router.delete('/:id', (req, res, next) => {
  try {
    const issue = db.prepare('SELECT * FROM book_issues WHERE id = ?').get(req.params.id);
    if (!issue) {
      next(new ApiError(404, 'Book issue not found'));
      return;
    }

    db.prepare('DELETE FROM book_issues WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
