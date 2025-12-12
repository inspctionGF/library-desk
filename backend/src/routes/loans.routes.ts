import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';
import { Loan, Book } from '../types';

const router = Router();

// Validation schemas
const createLoanSchema = z.object({
  bookId: z.string().uuid(),
  borrowerType: z.enum(['participant', 'other_reader']),
  borrowerId: z.string().uuid(),
  borrowerName: z.string().trim().min(1).max(200),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const renewLoanSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/loans
router.get('/', (req, res, next) => {
  try {
    const { status, borrowerId, bookId } = req.query;

    let query = 'SELECT * FROM loans WHERE 1=1';
    const params: unknown[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (borrowerId) {
      query += ' AND borrower_id = ?';
      params.push(borrowerId);
    }

    if (bookId) {
      query += ' AND book_id = ?';
      params.push(bookId);
    }

    query += ' ORDER BY created_at DESC';

    const loans = db.prepare(query).all(...params);

    // Update overdue status
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE loans SET status = 'overdue' 
      WHERE status = 'active' AND due_date < ?
    `).run(today);

    res.json(loans);
  } catch (error) {
    next(error);
  }
});

// GET /api/loans/:id
router.get('/:id', (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);

    if (!loan) {
      next(new ApiError(404, 'Loan not found'));
      return;
    }

    res.json(loan);
  } catch (error) {
    next(error);
  }
});

// POST /api/loans
router.post('/', validate(createLoanSchema), (req, res, next) => {
  try {
    const { bookId, borrowerType, borrowerId, borrowerName, dueDate } = req.body;

    // Check book exists and has available copies
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book | undefined;

    if (!book) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    if (book.available_copies < 1) {
      next(new ApiError(400, 'No copies available for this book'));
      return;
    }

    // Check borrower loan limit (max 3)
    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM loans 
      WHERE borrower_id = ? AND status != 'returned'
    `).get(borrowerId) as { count: number };

    if (activeLoans.count >= 3) {
      next(new ApiError(400, 'Borrower has reached maximum loan limit (3)'));
      return;
    }

    const id = crypto.randomUUID();
    const loanDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO loans (id, book_id, borrower_type, borrower_id, borrower_name, loan_date, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(id, bookId, borrowerType, borrowerId, borrowerName, loanDate, dueDate);

    // Decrease available copies
    db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?').run(bookId);

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'CREATE', 'loans', ?, 'loan', ?)
    `).run(crypto.randomUUID(), id, JSON.stringify({ bookId, borrowerName }));

    const newLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
    res.status(201).json(newLoan);
  } catch (error) {
    next(error);
  }
});

// POST /api/loans/:id/return
router.post('/:id/return', (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id) as Loan | undefined;

    if (!loan) {
      next(new ApiError(404, 'Loan not found'));
      return;
    }

    if (loan.status === 'returned') {
      next(new ApiError(400, 'Loan already returned'));
      return;
    }

    const returnDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE loans SET status = 'returned', return_date = ? WHERE id = ?
    `).run(returnDate, req.params.id);

    // Increase available copies
    db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(loan.book_id);

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'UPDATE', 'loans', ?, 'loan', 'Book returned')
    `).run(crypto.randomUUID(), req.params.id);

    const updated = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/loans/:id/renew
router.post('/:id/renew', validate(renewLoanSchema), (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id) as Loan | undefined;

    if (!loan) {
      next(new ApiError(404, 'Loan not found'));
      return;
    }

    if (loan.status === 'returned') {
      next(new ApiError(400, 'Cannot renew returned loan'));
      return;
    }

    const { dueDate } = req.body;

    db.prepare(`
      UPDATE loans SET due_date = ?, status = 'active' WHERE id = ?
    `).run(dueDate, req.params.id);

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'UPDATE', 'loans', ?, 'loan', ?)
    `).run(crypto.randomUUID(), req.params.id, JSON.stringify({ action: 'renew', newDueDate: dueDate }));

    const updated = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/loans/:id (soft delete by returning)
router.delete('/:id', (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id) as Loan | undefined;

    if (!loan) {
      next(new ApiError(404, 'Loan not found'));
      return;
    }

    // Actually delete only if returned
    if (loan.status === 'returned') {
      db.prepare('DELETE FROM loans WHERE id = ?').run(req.params.id);
    } else {
      next(new ApiError(400, 'Cannot delete active loan. Return the book first.'));
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
