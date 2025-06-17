import { Request, Response, NextFunction } from 'express';

export function ensureEmployer(req: Request, res: Response, next: NextFunction): void {
  if (req.user && req.user.role === 'EMPLOYER') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Only employer can access this resource.' });
}
