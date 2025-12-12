import { Request, Response, NextFunction } from 'express';
import db from '../database/connection';
import { ApiError } from './error.middleware';

// Simple PIN-based authentication middleware
export function authenticatePin(req: Request, res: Response, next: NextFunction): void {
  const pin = req.headers['x-admin-pin'] as string;

  if (!pin) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  // Get admin PIN from system config
  const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;
  
  if (!config || config.value !== pin) {
    next(new ApiError(401, 'Invalid PIN'));
    return;
  }

  next();
}

// Guest PIN validation
export function validateGuestPin(req: Request, res: Response, next: NextFunction): void {
  const pin = req.headers['x-guest-pin'] as string;

  if (!pin) {
    next(new ApiError(401, 'Guest PIN required'));
    return;
  }

  const guestPin = db.prepare(`
    SELECT * FROM guest_pins 
    WHERE pin = ? 
    AND expires_at > datetime('now')
    AND used = 0
  `).get(pin);

  if (!guestPin) {
    next(new ApiError(401, 'Invalid or expired guest PIN'));
    return;
  }

  // Mark PIN as used
  db.prepare('UPDATE guest_pins SET used = 1, used_at = datetime("now") WHERE pin = ?').run(pin);

  next();
}

// Optional auth - allows both admin and guest
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const adminPin = req.headers['x-admin-pin'] as string;
  const guestPin = req.headers['x-guest-pin'] as string;

  if (adminPin) {
    const config = db.prepare('SELECT value FROM system_config WHERE key = ?').get('adminPin') as { value: string } | undefined;
    if (config && config.value === adminPin) {
      (req as any).isAdmin = true;
      next();
      return;
    }
  }

  if (guestPin) {
    const pin = db.prepare(`
      SELECT * FROM guest_pins 
      WHERE pin = ? 
      AND expires_at > datetime('now')
    `).get(guestPin);
    
    if (pin) {
      (req as any).isGuest = true;
      next();
      return;
    }
  }

  next(new ApiError(401, 'Authentication required'));
}
