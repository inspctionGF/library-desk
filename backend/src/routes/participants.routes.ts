import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';
import { Participant } from '../types';

const router = Router();

// Validation schemas
const createParticipantSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  age: z.number().int().min(3).max(99),
  classId: z.string().uuid().optional(),
  gender: z.enum(['M', 'F']),
});

const updateParticipantSchema = createParticipantSchema.partial();

// Helper: Calculate age range
function getAgeRange(age: number): string {
  if (age >= 3 && age <= 5) return '3-5';
  if (age >= 6 && age <= 8) return '6-8';
  if (age >= 9 && age <= 11) return '9-11';
  if (age >= 12 && age <= 14) return '12-14';
  if (age >= 15 && age <= 18) return '15-18';
  if (age >= 19 && age <= 22) return '19-22';
  return '19-22';
}

// Helper: Generate participant number
function generateParticipantNumber(): string {
  const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('cdejNumber') as { value: string } | undefined;
  const cdej = config?.value || '0000';

  // Get max number
  const result = db.prepare(`
    SELECT number FROM participants 
    WHERE number LIKE 'HA-' || ? || '-%'
    ORDER BY number DESC LIMIT 1
  `).get(cdej) as { number: string } | undefined;

  let nextNum = 1;
  if (result) {
    const parts = result.number.split('-');
    const lastNum = parseInt(parts[2], 10);
    nextNum = lastNum + 1;
  }

  return `HA-${cdej}-${nextNum.toString().padStart(5, '0')}`;
}

// GET /api/participants
router.get('/', (req, res, next) => {
  try {
    const { classId, search, page = '1', pageSize = '50' } = req.query;

    let query = 'SELECT * FROM participants WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM participants WHERE 1=1';
    const params: unknown[] = [];

    if (classId) {
      query += ' AND class_id = ?';
      countQuery += ' AND class_id = ?';
      params.push(classId);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR number LIKE ?)';
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const { total } = db.prepare(countQuery).get(...params) as { total: number };

    const pageNum = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * size;

    query += ' ORDER BY last_name, first_name LIMIT ? OFFSET ?';

    const participants = db.prepare(query).all(...params, size, offset);

    res.json({
      data: participants,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/participants/:id
router.get('/:id', (req, res, next) => {
  try {
    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(req.params.id);

    if (!participant) {
      next(new ApiError(404, 'Participant not found'));
      return;
    }

    res.json(participant);
  } catch (error) {
    next(error);
  }
});

// GET /api/participants/:id/journal
router.get('/:id/journal', (req, res, next) => {
  try {
    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(req.params.id);

    if (!participant) {
      next(new ApiError(404, 'Participant not found'));
      return;
    }

    // Get loans
    const loans = db.prepare(`
      SELECT l.*, b.title as book_title, b.author as book_author
      FROM loans l
      JOIN books b ON l.book_id = b.id
      WHERE l.borrower_id = ?
      ORDER BY l.loan_date DESC
    `).all(req.params.id);

    // Get reading sessions
    const sessions = db.prepare(`
      SELECT rs.*, b.title as book_title
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      WHERE rs.participant_id = ?
      ORDER BY rs.date DESC
    `).all(req.params.id);

    // Get book resumes
    const resumes = db.prepare(`
      SELECT br.*, b.title as book_title
      FROM book_resumes br
      JOIN books b ON br.book_id = b.id
      WHERE br.participant_id = ?
      ORDER BY br.date DESC
    `).all(req.params.id);

    res.json({
      participant,
      loans,
      sessions,
      resumes,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/participants
router.post('/', validate(createParticipantSchema), (req, res, next) => {
  try {
    const { firstName, lastName, age, classId, gender } = req.body;
    const id = crypto.randomUUID();
    const number = generateParticipantNumber();
    const ageRange = getAgeRange(age);

    db.prepare(`
      INSERT INTO participants (id, number, first_name, last_name, age, age_range, class_id, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, number, firstName, lastName, age, ageRange, classId || null, gender);

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'CREATE', 'participants', ?, 'participant', ?)
    `).run(crypto.randomUUID(), id, JSON.stringify({ number, name: `${firstName} ${lastName}` }));

    const newParticipant = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
    res.status(201).json(newParticipant);
  } catch (error) {
    next(error);
  }
});

// PUT /api/participants/:id
router.put('/:id', validate(updateParticipantSchema), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM participants WHERE id = ?').get(req.params.id);

    if (!existing) {
      next(new ApiError(404, 'Participant not found'));
      return;
    }

    const updates = req.body;
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      classId: 'class_id',
      ageRange: 'age_range',
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      setClauses.push(`${dbField} = ?`);
      values.push(value);
    }

    // Recalculate age range if age changed
    if (updates.age !== undefined) {
      setClauses.push('age_range = ?');
      values.push(getAgeRange(updates.age));
    }

    if (setClauses.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE participants SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM participants WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/participants/:id
router.delete('/:id', (req, res, next) => {
  try {
    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(req.params.id) as Participant | undefined;

    if (!participant) {
      next(new ApiError(404, 'Participant not found'));
      return;
    }

    // Check for active loans
    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM loans 
      WHERE borrower_id = ? AND status != 'returned'
    `).get(req.params.id) as { count: number };

    if (activeLoans.count > 0) {
      next(new ApiError(400, 'Cannot delete participant with active loans'));
      return;
    }

    db.prepare('DELETE FROM participants WHERE id = ?').run(req.params.id);

    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, entity_id, entity_type, details)
      VALUES (?, datetime('now'), 'DELETE', 'participants', ?, 'participant', ?)
    `).run(crypto.randomUUID(), req.params.id, JSON.stringify({ number: participant.number }));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
