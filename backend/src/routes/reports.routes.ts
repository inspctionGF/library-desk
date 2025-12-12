import { Router } from 'express';
import db from '../database/connection';

const router = Router();

// GET /api/reports/books
router.get('/books', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: unknown[] = [];

    if (startDate) {
      dateFilter += ' AND l.loan_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND l.loan_date <= ?';
      params.push(endDate);
    }

    // Most loaned books
    const mostLoaned = db.prepare(`
      SELECT b.id, b.title, b.author, c.name as category_name, c.color as category_color,
        COUNT(l.id) as loan_count
      FROM books b
      LEFT JOIN loans l ON b.id = l.book_id ${dateFilter ? 'AND 1=1' + dateFilter : ''}
      LEFT JOIN categories c ON b.category_id = c.id
      GROUP BY b.id
      ORDER BY loan_count DESC
      LIMIT 10
    `).all(...params);

    // Most read books (reading sessions)
    const mostRead = db.prepare(`
      SELECT b.id, b.title, b.author, COUNT(rs.id) as read_count
      FROM books b
      LEFT JOIN reading_sessions rs ON b.id = rs.book_id ${dateFilter ? 'AND 1=1' + dateFilter.replace('l.loan_date', 'rs.date') : ''}
      GROUP BY b.id
      ORDER BY read_count DESC
      LIMIT 10
    `).all(...params);

    // Category distribution
    const categoryDistribution = db.prepare(`
      SELECT c.id, c.name, c.color, COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY book_count DESC
    `).all();

    // Total stats
    const totalBooks = db.prepare('SELECT COUNT(*) as count, SUM(quantity) as total_copies FROM books').get() as any;
    const availableBooks = db.prepare('SELECT SUM(available_copies) as count FROM books').get() as any;

    res.json({
      mostLoaned,
      mostRead,
      categoryDistribution,
      stats: {
        totalTitles: totalBooks.count,
        totalCopies: totalBooks.total_copies || 0,
        availableCopies: availableBooks.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/loans
router.get('/loans', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: unknown[] = [];

    if (startDate) {
      dateFilter += ' AND loan_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND loan_date <= ?';
      params.push(endDate);
    }

    const totalLoans = db.prepare(`SELECT COUNT(*) as count FROM loans WHERE 1=1 ${dateFilter}`).get(...params) as any;
    const activeLoans = db.prepare(`SELECT COUNT(*) as count FROM loans WHERE status = 'active'`).get() as any;
    const overdueLoans = db.prepare(`SELECT COUNT(*) as count FROM loans WHERE status = 'overdue'`).get() as any;
    const returnedLoans = db.prepare(`SELECT COUNT(*) as count FROM loans WHERE status = 'returned' ${dateFilter}`).get(...params) as any;

    // Top borrowers
    const topBorrowers = db.prepare(`
      SELECT borrower_name, borrower_type, COUNT(*) as loan_count
      FROM loans
      WHERE 1=1 ${dateFilter}
      GROUP BY borrower_id
      ORDER BY loan_count DESC
      LIMIT 10
    `).all(...params);

    // Loans by month
    const loansByMonth = db.prepare(`
      SELECT strftime('%Y-%m', loan_date) as month, COUNT(*) as count
      FROM loans
      WHERE 1=1 ${dateFilter}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all(...params);

    // Average loan duration (returned loans)
    const avgDuration = db.prepare(`
      SELECT AVG(julianday(return_date) - julianday(loan_date)) as avg_days
      FROM loans
      WHERE status = 'returned' AND return_date IS NOT NULL ${dateFilter}
    `).get(...params) as any;

    res.json({
      stats: {
        total: totalLoans.count,
        active: activeLoans.count,
        overdue: overdueLoans.count,
        returned: returnedLoans.count,
        avgDurationDays: avgDuration.avg_days ? Math.round(avgDuration.avg_days * 10) / 10 : null,
      },
      topBorrowers,
      loansByMonth,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/participants
router.get('/participants', (req, res, next) => {
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

    const totalParticipants = db.prepare('SELECT COUNT(*) as count FROM participants').get() as any;

    // By age range
    const byAgeRange = db.prepare(`
      SELECT age_range, COUNT(*) as count
      FROM participants
      GROUP BY age_range
      ORDER BY age_range
    `).all();

    // By gender
    const byGender = db.prepare(`
      SELECT gender, COUNT(*) as count
      FROM participants
      GROUP BY gender
    `).all();

    // Top readers
    const topReaders = db.prepare(`
      SELECT p.id, p.first_name || ' ' || p.last_name as name, p.number,
        COUNT(rs.id) as session_count
      FROM participants p
      LEFT JOIN reading_sessions rs ON p.id = rs.participant_id ${dateFilter ? 'AND 1=1' + dateFilter : ''}
      GROUP BY p.id
      ORDER BY session_count DESC
      LIMIT 10
    `).all(...params);

    // Participants with no activity
    const inactiveParticipants = db.prepare(`
      SELECT p.id, p.first_name || ' ' || p.last_name as name, p.number
      FROM participants p
      LEFT JOIN reading_sessions rs ON p.id = rs.participant_id
      LEFT JOIN loans l ON p.id = l.borrower_id AND l.borrower_type = 'participant'
      WHERE rs.id IS NULL AND l.id IS NULL
      LIMIT 20
    `).all();

    res.json({
      stats: {
        total: totalParticipants.count,
      },
      byAgeRange,
      byGender,
      topReaders,
      inactiveParticipants,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/classes
router.get('/classes', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: unknown[] = [];

    if (startDate) {
      dateFilter += ' AND crs.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND crs.date <= ?';
      params.push(endDate);
    }

    const classStats = db.prepare(`
      SELECT c.id, c.name, c.age_range, c.monitor_name,
        (SELECT COUNT(*) FROM participants WHERE class_id = c.id) as participant_count,
        (SELECT COUNT(*) FROM class_reading_sessions crs WHERE crs.class_id = c.id ${dateFilter}) as session_count,
        (SELECT AVG(attendee_count) FROM class_reading_sessions crs WHERE crs.class_id = c.id ${dateFilter}) as avg_attendance,
        (SELECT MAX(date) FROM class_reading_sessions WHERE class_id = c.id) as last_session
      FROM classes c
      ORDER BY session_count DESC
    `).all(...params);

    const totalClasses = db.prepare('SELECT COUNT(*) as count FROM classes').get() as any;
    const totalSessions = db.prepare(`SELECT COUNT(*) as count FROM class_reading_sessions WHERE 1=1 ${dateFilter.replace('crs.', '')}`).get(...params) as any;

    res.json({
      stats: {
        totalClasses: totalClasses.count,
        totalSessions: totalSessions.count,
      },
      classes: classStats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/resumes
router.get('/resumes', (req, res, next) => {
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

    const total = db.prepare(`SELECT COUNT(*) as count FROM book_resumes WHERE 1=1 ${dateFilter}`).get(...params) as any;
    const generated = db.prepare(`SELECT COUNT(*) as count FROM book_resumes WHERE status = 'generated' ${dateFilter}`).get(...params) as any;
    const submitted = db.prepare(`SELECT COUNT(*) as count FROM book_resumes WHERE status = 'submitted' ${dateFilter}`).get(...params) as any;
    const reviewed = db.prepare(`SELECT COUNT(*) as count FROM book_resumes WHERE status = 'reviewed' ${dateFilter}`).get(...params) as any;

    // Average rating
    const avgRating = db.prepare(`
      SELECT AVG(rating) as avg FROM book_resumes 
      WHERE rating IS NOT NULL ${dateFilter}
    `).get(...params) as any;

    // By month
    const byMonth = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM book_resumes
      WHERE 1=1 ${dateFilter}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all(...params);

    res.json({
      stats: {
        total: total.count,
        generated: generated.count,
        submitted: submitted.count,
        reviewed: reviewed.count,
        avgRating: avgRating.avg ? Math.round(avgRating.avg * 10) / 10 : null,
      },
      byMonth,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/extra-activities
router.get('/extra-activities', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: unknown[] = [];

    if (startDate) {
      dateFilter += ' AND ea.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND ea.date <= ?';
      params.push(endDate);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM extra_activities ea WHERE 1=1 ${dateFilter}`).get(...params) as any;

    // By type
    const byType = db.prepare(`
      SELECT eat.id, eat.name, eat.color, COUNT(ea.id) as count
      FROM extra_activity_types eat
      LEFT JOIN extra_activities ea ON eat.id = ea.type_id ${dateFilter ? 'AND 1=1' + dateFilter : ''}
      GROUP BY eat.id
      ORDER BY count DESC
    `).all(...params);

    // By month
    const byMonth = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM extra_activities ea
      WHERE 1=1 ${dateFilter}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all(...params);

    res.json({
      stats: {
        total: total.count,
      },
      byType,
      byMonth,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/dashboard
router.get('/dashboard', (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const books = db.prepare('SELECT COUNT(*) as count, SUM(quantity) as total FROM books').get() as any;
    const participants = db.prepare('SELECT COUNT(*) as count FROM participants').get() as any;
    const activeLoans = db.prepare(`SELECT COUNT(*) as count FROM loans WHERE status IN ('active', 'overdue')`).get() as any;
    const overdueLoans = db.prepare(`SELECT COUNT(*) as count FROM loans WHERE status = 'overdue'`).get() as any;
    const openIssues = db.prepare(`SELECT COUNT(*) as count FROM book_issues WHERE status = 'open'`).get() as any;

    // This month stats
    const thisMonthLoans = db.prepare(`
      SELECT COUNT(*) as count FROM loans 
      WHERE loan_date >= date('now', 'start of month')
    `).get() as any;

    const thisMonthSessions = db.prepare(`
      SELECT COUNT(*) as count FROM reading_sessions 
      WHERE date >= date('now', 'start of month')
    `).get() as any;

    // Pending tasks
    const pendingTasks = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE status != 'completed'
    `).get() as any;

    res.json({
      books: {
        totalTitles: books.count,
        totalCopies: books.total || 0,
      },
      participants: participants.count,
      loans: {
        active: activeLoans.count,
        overdue: overdueLoans.count,
        thisMonth: thisMonthLoans.count,
      },
      readingSessions: {
        thisMonth: thisMonthSessions.count,
      },
      issues: {
        open: openIssues.count,
      },
      tasks: {
        pending: pendingTasks.count,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
