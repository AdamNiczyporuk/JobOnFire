import { Request, Response, NextFunction } from 'express';

export function ensureCandidate(req: Request, res: Response, next: NextFunction): void {
  if (req.user && req.user.role === 'CANDIDATE') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Only candidate can access this resource.' });
}
