import { Router } from 'express';
import { z } from 'zod';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';
import crypto from 'crypto';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  pin: z.string().length(6, 'PIN must be 6 digits'),
});

const guestPinSchema = z.object({
  expiresInHours: z.number().min(1).max(72).default(24),
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), (req, res, next) => {
  try {
    const { pin } = req.body;

    // Check admin PIN
    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;

    if (config && config.value === pin) {
      // Log successful login
      const auditId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO audit_log (id, timestamp, action, module, details)
        VALUES (?, datetime('now'), 'LOGIN', 'auth', 'Admin login successful')
      `).run(auditId);

      res.json({
        success: true,
        role: 'admin',
        message: 'Login successful',
      });
      return;
    }

    // Check guest PIN
    const guestPin = db.prepare(`
      SELECT * FROM guest_pins 
      WHERE pin = ? 
      AND expires_at > datetime('now')
      AND used = 0
    `).get(pin);

    if (guestPin) {
      // Mark as used
      db.prepare('UPDATE guest_pins SET used = 1, used_at = datetime("now") WHERE pin = ?').run(pin);

      res.json({
        success: true,
        role: 'guest',
        message: 'Guest login successful',
      });
      return;
    }

    // Log failed attempt
    const auditId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO audit_log (id, timestamp, action, module, details)
      VALUES (?, datetime('now'), 'LOGIN', 'auth', 'Failed login attempt')
    `).run(auditId);

    next(new ApiError(401, 'Invalid PIN'));
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/guest-pin (admin only)
router.post('/guest-pin', validate(guestPinSchema), (req, res, next) => {
  try {
    const adminPin = req.headers['x-admin-pin'] as string;
    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;

    if (!config || config.value !== adminPin) {
      next(new ApiError(401, 'Admin authentication required'));
      return;
    }

    const { expiresInHours } = req.body;

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO guest_pins (id, pin, expires_at)
      VALUES (?, ?, datetime('now', '+' || ? || ' hours'))
    `).run(id, pin, expiresInHours);

    res.status(201).json({
      id,
      pin,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/guest-pins (admin only)
router.get('/guest-pins', (req, res, next) => {
  try {
    const adminPin = req.headers['x-admin-pin'] as string;
    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;

    if (!config || config.value !== adminPin) {
      next(new ApiError(401, 'Admin authentication required'));
      return;
    }

    const pins = db.prepare('SELECT * FROM guest_pins ORDER BY created_at DESC').all();
    res.json(pins);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/auth/guest-pins/:id (admin only)
router.delete('/guest-pins/:id', (req, res, next) => {
  try {
    const adminPin = req.headers['x-admin-pin'] as string;
    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;

    if (!config || config.value !== adminPin) {
      next(new ApiError(401, 'Admin authentication required'));
      return;
    }

    const result = db.prepare('DELETE FROM guest_pins WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      next(new ApiError(404, 'Guest PIN not found'));
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
