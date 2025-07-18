import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export function ensureCandidate(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: 'Użytkownik nie jest zalogowany' });
    return;
  }

  if (req.user.role !== UserRole.CANDIDATE) {
    res.status(403).json({ message: 'Dostęp tylko dla kandydatów' });
    return;
  }

  next();
}
