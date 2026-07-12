import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: (err as any).errors,
    });
    return;
  }

  console.error('UNHANDLED ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
