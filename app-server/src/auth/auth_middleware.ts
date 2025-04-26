import { Request, Response, NextFunction } from 'express';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.isAuthenticated()) {
      return next(); // Użytkownik jest zalogowany, kontynuuj
    }
    res.status(401).json({ message: 'You need to be logged in to access this resource.' });
  }