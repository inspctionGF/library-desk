import { Router } from 'express';
import { z } from 'zod';
import db from '../database/connection';
import { validate } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// Validation schemas
const configSchema = z.object({
  cdejNumber: z.string().regex(/^\d{4}$/).optional(),
  churchName: z.string().trim().max(200).optional(),
  directorName: z.string().trim().max(100).optional(),
  managerName: z.string().trim().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  adminPin: z.string().length(6).optional(),
  // Admin profile fields
  adminName: z.string().trim().max(100).optional(),
  adminEmail: z.string().email().max(255).optional().or(z.literal('')),
  adminAvatar: z.string().max(700000).optional(), // Base64 image (~500KB)
});

// GET /api/config
router.get('/', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT key, value FROM system_config').all() as { key: string; value: string }[];
    
    const config: Record<string, string> = {};
    for (const row of rows) {
      // Don't expose admin PIN
      if (row.key !== 'adminPin') {
        config[row.key] = row.value;
      }
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
});

// PUT /api/config
router.put('/', validate(configSchema), (req, res, next) => {
  try {
    const updates = req.body;

    const upsert = db.prepare(`
      INSERT INTO system_config (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          upsert.run(key, value);
        }
      }
    });

    transaction();

    // Return updated config (excluding adminPin)
    const rows = db.prepare('SELECT key, value FROM system_config').all() as { key: string; value: string }[];
    const config: Record<string, string> = {};
    for (const row of rows) {
      if (row.key !== 'adminPin') {
        config[row.key] = row.value;
      }
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
});

// POST /api/config/verify-pin
router.post('/verify-pin', (req, res, next) => {
  try {
    const { pin } = req.body;

    if (!pin || typeof pin !== 'string') {
      next(new ApiError(400, 'PIN is required'));
      return;
    }

    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;

    if (config && config.value === pin) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/config/change-pin
router.post('/change-pin', (req, res, next) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      next(new ApiError(400, 'Current PIN and new PIN are required'));
      return;
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      next(new ApiError(400, 'New PIN must be exactly 6 digits'));
      return;
    }

    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;

    if (!config || config.value !== currentPin) {
      next(new ApiError(401, 'Current PIN is incorrect'));
      return;
    }

    db.prepare(`
      INSERT INTO system_config (key, value, updated_at)
      VALUES ('adminPin', ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(newPin);

    res.json({ success: true, message: 'PIN changed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
