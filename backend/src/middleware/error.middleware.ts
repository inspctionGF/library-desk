import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  // SQLite constraint errors
  if (err.message.includes('UNIQUE constraint failed')) {
    res.status(409).json({
      error: 'A record with this value already exists',
    });
    return;
  }

  if (err.message.includes('FOREIGN KEY constraint failed')) {
    res.status(400).json({
      error: 'Referenced record does not exist',
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}
