import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    
    // Ensure the user still exists in the database
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid token or token expired.', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
