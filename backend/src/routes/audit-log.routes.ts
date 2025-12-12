import { Router } from 'express';
import db from '../database/connection';

const router = Router();

// GET /api/audit-log
router.get('/', (req, res, next) => {
  try {
    const { module, action, startDate, endDate, page = '1', pageSize = '100' } = req.query;

    let query = 'SELECT * FROM audit_log WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM audit_log WHERE 1=1';
    const params: unknown[] = [];

    if (module) {
      query += ' AND module = ?';
      countQuery += ' AND module = ?';
      params.push(module);
    }

    if (action) {
      query += ' AND action = ?';
      countQuery += ' AND action = ?';
      params.push(action);
    }

    if (startDate) {
      query += ' AND timestamp >= ?';
      countQuery += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      countQuery += ' AND timestamp <= ?';
      params.push(endDate);
    }

    const { total } = db.prepare(countQuery).get(...params) as { total: number };

    const pageNum = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * size;

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';

    const logs = db.prepare(query).all(...params, size, offset);

    res.json({
      data: logs,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/audit-log/stats
router.get('/stats', (req, res, next) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM audit_log').get() as any;

    const byAction = db.prepare(`
      SELECT action, COUNT(*) as count 
      FROM audit_log 
      GROUP BY action 
      ORDER BY count DESC
    `).all();

    const byModule = db.prepare(`
      SELECT module, COUNT(*) as count 
      FROM audit_log 
      GROUP BY module 
      ORDER BY count DESC
    `).all();

    const recentActivity = db.prepare(`
      SELECT strftime('%Y-%m-%d', timestamp) as date, COUNT(*) as count
      FROM audit_log
      WHERE timestamp >= datetime('now', '-30 days')
      GROUP BY date
      ORDER BY date DESC
    `).all();

    res.json({
      total: total.count,
      byAction,
      byModule,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
