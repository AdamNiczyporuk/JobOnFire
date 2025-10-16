import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureEmployer } from '../auth/ensureEmployer';
import { ensureCandidate } from '../auth/ensureCandidate';
import { prisma } from '../db';

import { 
  validateEmployerProfile
} from '../utils/employerHelpers';
import { validateCandidateProfile } from '../utils/applicationHelpers';

export const router = Router();

// Helpers
function isValidMeetingType(type: any): type is 'ONLINE' | 'OFFLINE' {
  return type === 'ONLINE' || type === 'OFFLINE';
}

// ===== Candidate endpoints =====

// GET /meetings/candidate - list candidate meetings
router.get('/candidate', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const where: any = {
      application: {
        candidateProfileId: candidateProfile.id
      }
    };

    if (from || to) {
      where.dateTime = {};
      if (from) where.dateTime.gte = from;
      if (to) where.dateTime.lte = to;
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        orderBy: { dateTime: 'desc' },
        include: {
          application: {
            include: {
              jobOffer: {
                select: {
                  id: true,
                  name: true,
                  employerProfile: {
                    select: {
                      id: true,
                      companyName: true
                    }
                  }
                }
              }
            }
          }
        },
        skip: offset,
        take: limit
      }),
      prisma.meeting.count({ where })
    ]);

    res.json({
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Błąd podczas pobierania spotkań kandydata:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /meetings/candidate/:id - get candidate meeting detail
router.get('/candidate/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID spotkania' });
      return;
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        application: { candidateProfileId: candidateProfile.id }
      },
      include: {
        application: {
          include: {
            jobOffer: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      res.status(404).json({ message: 'Spotkanie nie zostało znalezione' });
      return;
    }

    res.json(meeting);
  } catch (error) {
    console.error('Błąd podczas pobierania szczegółów spotkania:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// Candidate is read-only: no create/update/delete endpoints

// ===== Employer endpoints =====

// GET /meetings/employer - list employer meetings
router.get('/employer', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const where: any = {
      application: {
        jobOffer: {
          employerProfileId: employerProfile.id
        }
      }
    };

    if (from || to) {
      where.dateTime = {};
      if (from) where.dateTime.gte = from;
      if (to) where.dateTime.lte = to;
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        orderBy: { dateTime: 'desc' },
        include: {
          application: {
            include: {
              jobOffer: {
                select: {
                  id: true,
                  name: true
                }
              },
              candidateProfile: {
                select: {
                  id: true,
                  name: true,
                  lastName: true
                }
              }
            }
          }
        },
        skip: offset,
        take: limit
      }),
      prisma.meeting.count({ where })
    ]);

    res.json({
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Błąd podczas pobierania spotkań pracodawcy:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /meetings/employer/:id - employer meeting detail
router.get('/employer/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID spotkania' });
      return;
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        application: { jobOffer: { employerProfileId: employerProfile.id } }
      },
      include: {
        application: {
          include: {
            jobOffer: {
              select: { id: true, name: true }
            },
            candidateProfile: {
              select: { id: true, name: true, lastName: true }
            }
          }
        }
      }
    });

    if (!meeting) {
      res.status(404).json({ message: 'Spotkanie nie zostało znalezione' });
      return;
    }

    res.json(meeting);
  } catch (error) {
    console.error('Błąd podczas pobierania szczegółów spotkania:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// POST /meetings/employer - create meeting for employer application
router.post('/employer', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    const { applicationId, dateTime, type, contributors, onlineMeetingUrl, message } = req.body;

    if (!applicationId || !dateTime || !type) {
      res.status(400).json({ message: 'Brak wymaganych pól: applicationId, dateTime, type' });
      return;
    }

    if (!isValidMeetingType(type)) {
      res.status(400).json({ message: 'Nieprawidłowy typ spotkania' });
      return;
    }

    const application = await prisma.applicationForJobOffer.findFirst({
      where: { id: applicationId, jobOffer: { employerProfileId: employerProfile.id } }
    });

    if (!application) {
      res.status(404).json({ message: 'Aplikacja nie została znaleziona' });
      return;
    }

    const meeting = await prisma.meeting.create({
      data: {
        dateTime: new Date(dateTime),
        type,
        contributors,
        onlineMeetingUrl,
        message,
        applicationForJobOfferId: application.id
      }
    });

    res.status(201).json({ message: 'Spotkanie zostało utworzone', meeting });
  } catch (error) {
    console.error('Błąd podczas tworzenia spotkania:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// PUT /meetings/employer/:id - update employer meeting
router.put('/employer/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID spotkania' });
      return;
    }

    const existing = await prisma.meeting.findFirst({
      where: { id, application: { jobOffer: { employerProfileId: employerProfile.id } } }
    });

    if (!existing) {
      res.status(404).json({ message: 'Spotkanie nie zostało znalezione' });
      return;
    }

    const { dateTime, type, contributors, onlineMeetingUrl, message } = req.body;
    if (type && !isValidMeetingType(type)) {
      res.status(400).json({ message: 'Nieprawidłowy typ spotkania' });
      return;
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        dateTime: dateTime ? new Date(dateTime) : existing.dateTime,
        type: type ?? existing.type,
        contributors: contributors !== undefined ? contributors : existing.contributors,
        onlineMeetingUrl: onlineMeetingUrl !== undefined ? onlineMeetingUrl : existing.onlineMeetingUrl,
        message: message !== undefined ? message : existing.message
      }
    });

    res.json({ message: 'Spotkanie zostało zaktualizowane', meeting: updated });
  } catch (error) {
    console.error('Błąd podczas aktualizacji spotkania:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// DELETE /meetings/employer/:id - delete employer meeting
router.delete('/employer/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID spotkania' });
      return;
    }

    const existing = await prisma.meeting.findFirst({
      where: { id, application: { jobOffer: { employerProfileId: employerProfile.id } } }
    });

    if (!existing) {
      res.status(404).json({ message: 'Spotkanie nie zostało znalezione' });
      return;
    }

    await prisma.meeting.delete({ where: { id } });
    res.json({ message: 'Spotkanie zostało usunięte' });
  } catch (error) {
    console.error('Błąd podczas usuwania spotkania:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

