import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// ============ INDIVIDUAL READING SESSIONS ============

const createSessionSchema = z.object({
  participantId: z.string().uuid(),
  bookId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readingType: z.enum(['assignment', 'research', 'normal']),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/reading-sessions
router.get('/', (req, res, next) => {
  try {
    const { participantId, bookId, readingType, startDate, endDate, page = '1', pageSize = '50' } = req.query;

    let query = `
      SELECT rs.*, 
        p.first_name || ' ' || p.last_name as participant_name,
        p.number as participant_number,
        b.title as book_title,
        b.author as book_author
      FROM reading_sessions rs
      JOIN participants p ON rs.participant_id = p.id
      JOIN books b ON rs.book_id = b.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM reading_sessions rs WHERE 1=1';
    const params: unknown[] = [];

    if (participantId) {
      query += ' AND rs.participant_id = ?';
      countQuery += ' AND rs.participant_id = ?';
      params.push(participantId);
    }

    if (bookId) {
      query += ' AND rs.book_id = ?';
      countQuery += ' AND rs.book_id = ?';
      params.push(bookId);
    }

    if (readingType) {
      query += ' AND rs.reading_type = ?';
      countQuery += ' AND rs.reading_type = ?';
      params.push(readingType);
    }

    if (startDate) {
      query += ' AND rs.date >= ?';
      countQuery += ' AND rs.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND rs.date <= ?';
      countQuery += ' AND rs.date <= ?';
      params.push(endDate);
    }

    const { total } = db.prepare(countQuery).get(...params) as { total: number };

    const pageNum = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * size;

    query += ' ORDER BY rs.date DESC, rs.created_at DESC LIMIT ? OFFSET ?';

    const sessions = db.prepare(query).all(...params, size, offset);

    res.json({
      data: sessions,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reading-sessions/stats
router.get('/stats', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: unknown[] = [];

    if (startDate) {
      dateFilter += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND date <= ?';
      params.push(endDate);
    }

    const totalSessions = db.prepare(`SELECT COUNT(*) as count FROM reading_sessions WHERE 1=1 ${dateFilter}`)
      .get(...params) as { count: number };

    const thisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM reading_sessions 
      WHERE date >= date('now', 'start of month') ${dateFilter}
    `).get(...params) as { count: number };

    const byType = db.prepare(`
      SELECT reading_type, COUNT(*) as count 
      FROM reading_sessions WHERE 1=1 ${dateFilter}
      GROUP BY reading_type
    `).all(...params);

    const mostActiveParticipant = db.prepare(`
      SELECT p.first_name || ' ' || p.last_name as name, COUNT(*) as session_count
      FROM reading_sessions rs
      JOIN participants p ON rs.participant_id = p.id
      WHERE 1=1 ${dateFilter}
      GROUP BY rs.participant_id
      ORDER BY session_count DESC
      LIMIT 1
    `).get(...params);

    const mostReadBook = db.prepare(`
      SELECT b.title, COUNT(*) as read_count
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      WHERE 1=1 ${dateFilter}
      GROUP BY rs.book_id
      ORDER BY read_count DESC
      LIMIT 1
    `).get(...params);

    res.json({
      totalSessions: totalSessions.count,
      thisMonth: thisMonth.count,
      byType,
      mostActiveParticipant,
      mostReadBook,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reading-sessions/:id
router.get('/:id', (req, res, next) => {
  try {
    if (req.params.id === 'stats' || req.params.id === 'class') {
      next();
      return;
    }

    const session = db.prepare(`
      SELECT rs.*, 
        p.first_name || ' ' || p.last_name as participant_name,
        b.title as book_title
      FROM reading_sessions rs
      JOIN participants p ON rs.participant_id = p.id
      JOIN books b ON rs.book_id = b.id
      WHERE rs.id = ?
    `).get(req.params.id);

    if (!session) {
      next(new ApiError(404, 'Reading session not found'));
      return;
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// POST /api/reading-sessions
router.post('/', validate(createSessionSchema), (req, res, next) => {
  try {
    const { participantId, bookId, date, readingType, notes } = req.body;

    // Verify participant exists
    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(participantId);
    if (!participant) {
      next(new ApiError(404, 'Participant not found'));
      return;
    }

    // Verify book exists
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    if (!book) {
      next(new ApiError(404, 'Book not found'));
      return;
    }

    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO reading_sessions (id, participant_id, book_id, date, reading_type, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, participantId, bookId, date, readingType, notes || null);

    const newSession = db.prepare(`
      SELECT rs.*, 
        p.first_name || ' ' || p.last_name as participant_name,
        b.title as book_title
      FROM reading_sessions rs
      JOIN participants p ON rs.participant_id = p.id
      JOIN books b ON rs.book_id = b.id
      WHERE rs.id = ?
    `).get(id);

    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
});

// PUT /api/reading-sessions/:id
router.put('/:id', validate(createSessionSchema.partial()), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Reading session not found'));
      return;
    }

    const fieldMap: Record<string, string> = {
      participantId: 'participant_id',
      bookId: 'book_id',
      readingType: 'reading_type',
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
      db.prepare(`UPDATE reading_sessions SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reading-sessions/:id
router.delete('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Reading session not found'));
      return;
    }

    db.prepare('DELETE FROM reading_sessions WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============ CLASS READING SESSIONS ============

const createClassSessionSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attendeeCount: z.number().int().min(1),
  sessionType: z.enum(['bulk', 'detailed']).default('bulk'),
  notes: z.string().trim().max(1000).optional(),
});

// GET /api/reading-sessions/class
router.get('/class', (req, res, next) => {
  try {
    const { classId, startDate, endDate } = req.query;

    let query = `
      SELECT crs.*, c.name as class_name, c.age_range
      FROM class_reading_sessions crs
      JOIN classes c ON crs.class_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (classId) {
      query += ' AND crs.class_id = ?';
      params.push(classId);
    }

    if (startDate) {
      query += ' AND crs.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND crs.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY crs.date DESC';

    const sessions = db.prepare(query).all(...params);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// POST /api/reading-sessions/class
router.post('/class', validate(createClassSessionSchema), (req, res, next) => {
  try {
    const { classId, date, attendeeCount, sessionType, notes } = req.body;

    // Verify class exists
    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
    if (!cls) {
      next(new ApiError(404, 'Class not found'));
      return;
    }

    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO class_reading_sessions (id, class_id, date, attendee_count, session_type, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, classId, date, attendeeCount, sessionType, notes || null);

    const newSession = db.prepare(`
      SELECT crs.*, c.name as class_name
      FROM class_reading_sessions crs
      JOIN classes c ON crs.class_id = c.id
      WHERE crs.id = ?
    `).get(id);

    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reading-sessions/class/:id
router.delete('/class/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM class_reading_sessions WHERE id = ?').get(req.params.id);
    if (!existing) {
      next(new ApiError(404, 'Class reading session not found'));
      return;
    }

    db.prepare('DELETE FROM class_reading_sessions WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
