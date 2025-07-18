import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureCandidate } from '../auth/ensureCandidate';
import { prisma } from '../db';
import { applicationCreateValidation, applicationUpdateValidation } from '../validation/applicationValidation';
import { 
  validateCandidateProfile,
  validateJobOfferExists,
  validateCandidateCV,
  validateApplicationExists,
  checkDuplicateApplication
} from '../utils/applicationHelpers';

export const router = Router();

// POST /applications - Wysłanie nowej aplikacji na ofertę pracy
router.post('/', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    // Walidacja danych wejściowych
    const { error, value } = applicationCreateValidation.validate(req.body);
    if (error) {
      res.status(400).json({ 
        message: 'Nieprawidłowe dane wejściowe', 
        details: error.details 
      });
      return;
    }

    const { message, jobOfferId, cvId, answers } = value;

    // Walidacja profilu kandydata
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    // Walidacja czy oferta pracy istnieje i jest aktywna
    const jobOffer = await validateJobOfferExists(jobOfferId, res);
    if (!jobOffer) return;

    // Walidacja czy CV należy do kandydata
    const cv = await validateCandidateCV(candidateProfile.id, cvId, res);
    if (!cv) return;

    // Sprawdzenie czy kandydat już nie wysłał aplikacji na tę ofertę
    const isDuplicate = await checkDuplicateApplication(candidateProfile.id, jobOfferId, res);
    if (isDuplicate) return;

    // Walidacja odpowiedzi na pytania rekrutacyjne (jeśli zostały podane)
    if (answers && answers.length > 0 && jobOffer.questions.length > 0) {
      const requiredQuestionIds = jobOffer.questions.map((q: any) => q.id);
      const providedQuestionIds = answers.map((a: any) => a.recruitmentQuestionId);
      
      // Sprawdź czy wszystkie podane pytania należą do tej oferty
      const invalidQuestions = providedQuestionIds.filter((id: number) => !requiredQuestionIds.includes(id));
      if (invalidQuestions.length > 0) {
        res.status(400).json({ 
          message: 'Niektóre pytania nie należą do tej oferty pracy',
          invalidQuestionIds: invalidQuestions
        });
        return;
      }
    }

    // Tworzenie aplikacji w transakcji
    const application = await prisma.$transaction(async (tx) => {
      // Utworzenie aplikacji
      const newApplication = await tx.applicationForJobOffer.create({
        data: {
          message: message || '',
          status: 'PENDING',
          candidateProfileId: candidateProfile.id,
          jobOfferId: jobOfferId,
          cvId: cvId
        }
      });

      // Dodanie odpowiedzi na pytania rekrutacyjne (jeśli istnieją)
      if (answers && answers.length > 0) {
        await tx.candidateAnswer.createMany({
          data: answers.map((answer: any) => ({
            applicationForJobOfferId: newApplication.id,
            recruitmentQuestionId: answer.recruitmentQuestionId,
            answer: answer.answer || ''
          }))
        });
      }

      return newApplication;
    });

    // Pobranie pełnych danych aplikacji do odpowiedzi
    const fullApplication = await prisma.applicationForJobOffer.findUnique({
      where: { id: application.id },
      include: {
        jobOffer: {
          include: {
            employerProfile: {
              select: {
                id: true,
                companyName: true,
                companyImageUrl: true
              }
            },
            lokalization: {
              select: {
                city: true,
                state: true
              }
            }
          }
        },
        candidateCV: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Aplikacja została wysłana pomyślnie',
      application: fullApplication
    });

  } catch (error) {
    console.error('Błąd podczas wysyłania aplikacji:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /applications - Pobranie wszystkich aplikacji kandydata
router.get('/', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    // Parametry paginacji i filtrowania
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    // Budowanie warunków where
    const whereConditions: any = {
      candidateProfileId: candidateProfile.id
    };

    if (status && ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'].includes(status)) {
      whereConditions.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.applicationForJobOffer.findMany({
        where: whereConditions,
        include: {
          jobOffer: {
            include: {
              employerProfile: {
                select: {
                  id: true,
                  companyName: true,
                  companyImageUrl: true
                }
              },
              lokalization: {
                select: {
                  city: true,
                  state: true
                }
              }
            }
          },
          candidateCV: {
            select: {
              id: true,
              name: true
            }
          },
          response: true
        },
        orderBy: {
          id: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.applicationForJobOffer.count({
        where: whereConditions
      })
    ]);

    res.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Błąd podczas pobierania aplikacji:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /applications/:id - Pobranie szczegółów konkretnej aplikacji
router.get('/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID aplikacji' });
      return;
    }

    const application = await validateApplicationExists(applicationId, candidateProfile.id, res);
    if (!application) return;

    res.json(application);

  } catch (error) {
    console.error('Błąd podczas pobierania aplikacji:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// PUT /applications/:id - Aktualizacja aplikacji (kandydat może tylko anulować)
router.put('/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID aplikacji' });
      return;
    }

    // Walidacja danych wejściowych
    const { error, value } = applicationUpdateValidation.validate(req.body);
    if (error) {
      res.status(400).json({ 
        message: 'Nieprawidłowe dane wejściowe', 
        details: error.details 
      });
      return;
    }

    const application = await validateApplicationExists(applicationId, candidateProfile.id, res);
    if (!application) return;

    // Kandydat może tylko anulować własną aplikację i tylko jeśli ma status PENDING
    if (value.status && value.status !== 'CANCELED') {
      res.status(403).json({ message: 'Kandydaci mogą tylko anulować swoje aplikacje' });
      return;
    }

    if (application.status !== 'PENDING') {
      res.status(400).json({ message: 'Można anulować tylko aplikacje o statusie PENDING' });
      return;
    }

    // Aktualizacja aplikacji
    const updatedApplication = await prisma.applicationForJobOffer.update({
      where: { id: applicationId },
      data: {
        status: value.status || application.status,
        message: value.message !== undefined ? value.message : application.message
      },
      include: {
        jobOffer: {
          include: {
            employerProfile: {
              select: {
                id: true,
                companyName: true,
                companyImageUrl: true
              }
            }
          }
        },
        candidateCV: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Aplikacja została zaktualizowana',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Błąd podczas aktualizacji aplikacji:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// DELETE /applications/:id - Usunięcie aplikacji (tylko jeśli status to PENDING lub CANCELED)
router.delete('/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID aplikacji' });
      return;
    }

    const application = await validateApplicationExists(applicationId, candidateProfile.id, res);
    if (!application) return;

    // Można usunąć tylko aplikacje o statusie PENDING lub CANCELED
    if (!['PENDING', 'CANCELED'].includes(application.status)) {
      res.status(400).json({ 
        message: 'Można usunąć tylko aplikacje o statusie PENDING lub CANCELED' 
      });
      return;
    }

    // Usunięcie aplikacji w transakcji (wraz z odpowiedziami)
    await prisma.$transaction(async (tx) => {
      // Usuń odpowiedzi na pytania
      await tx.candidateAnswer.deleteMany({
        where: { applicationForJobOfferId: applicationId }
      });

      // Usuń aplikację
      await tx.applicationForJobOffer.delete({
        where: { id: applicationId }
      });
    });

    res.json({ message: 'Aplikacja została usunięta' });

  } catch (error) {
    console.error('Błąd podczas usuwania aplikacji:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /applications/stats - Statystyki aplikacji kandydata
router.get('/stats/summary', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const stats = await prisma.applicationForJobOffer.groupBy({
      by: ['status'],
      where: {
        candidateProfileId: candidateProfile.id
      },
      _count: {
        status: true
      }
    });

    const totalApplications = await prisma.applicationForJobOffer.count({
      where: {
        candidateProfileId: candidateProfile.id
      }
    });

    // Formatowanie statystyk
    const formattedStats = {
      total: totalApplications,
      pending: 0,
      accepted: 0,
      rejected: 0,
      canceled: 0
    };

    stats.forEach(stat => {
      switch (stat.status) {
        case 'PENDING':
          formattedStats.pending = stat._count.status;
          break;
        case 'ACCEPTED':
          formattedStats.accepted = stat._count.status;
          break;
        case 'REJECTED':
          formattedStats.rejected = stat._count.status;
          break;
        case 'CANCELED':
          formattedStats.canceled = stat._count.status;
          break;
      }
    });

    res.json(formattedStats);

  } catch (error) {
    console.error('Błąd podczas pobierania statystyk:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// PUT /applications/:id/answers - Aktualizacja odpowiedzi na pytania rekrutacyjne
router.put('/:id/answers', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID aplikacji' });
      return;
    }

    const application = await validateApplicationExists(applicationId, candidateProfile.id, res);
    if (!application) return;

    // Można aktualizować odpowiedzi tylko dla aplikacji o statusie PENDING
    if (application.status !== 'PENDING') {
      res.status(400).json({ message: 'Można aktualizować odpowiedzi tylko dla aplikacji o statusie PENDING' });
      return;
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ message: 'Brak odpowiedzi lub nieprawidłowy format' });
      return;
    }

    // Walidacja czy wszystkie pytania należą do tej oferty pracy
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: application.jobOffer.id },
      include: { questions: true }
    });

    if (!jobOffer) {
      res.status(404).json({ message: 'Oferta pracy nie została znaleziona' });
      return;
    }

    const validQuestionIds = jobOffer.questions.map(q => q.id);
    const providedQuestionIds = answers.map((a: any) => a.recruitmentQuestionId);

    const invalidQuestions = providedQuestionIds.filter((id: number) => !validQuestionIds.includes(id));
    if (invalidQuestions.length > 0) {
      res.status(400).json({ 
        message: 'Niektóre pytania nie należą do tej oferty pracy',
        invalidQuestionIds: invalidQuestions
      });
      return;
    }

    // Aktualizacja odpowiedzi w transakcji
    await prisma.$transaction(async (tx) => {
      // Usuń istniejące odpowiedzi
      await tx.candidateAnswer.deleteMany({
        where: { applicationForJobOfferId: applicationId }
      });

      // Dodaj nowe odpowiedzi
      if (answers.length > 0) {
        await tx.candidateAnswer.createMany({
          data: answers.map((answer: any) => ({
            applicationForJobOfferId: applicationId,
            recruitmentQuestionId: answer.recruitmentQuestionId,
            answer: answer.answer || ''
          }))
        });
      }
    });

    // Pobranie zaktualizowanych danych aplikacji
    const updatedApplication = await prisma.applicationForJobOffer.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: {
          include: {
            employerProfile: {
              select: {
                id: true,
                companyName: true,
                companyImageUrl: true
              }
            },
            questions: true
          }
        },
        candidateCV: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Odpowiedzi na pytania rekrutacyjne zostały zaktualizowane',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Błąd podczas aktualizacji odpowiedzi:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /applications/:id/questions - Pobranie pytań rekrutacyjnych dla aplikacji
router.get('/:id/questions', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID aplikacji' });
      return;
    }

    const application = await validateApplicationExists(applicationId, candidateProfile.id, res);
    if (!application) return;

    // Pobranie pytań rekrutacyjnych dla tej oferty wraz z odpowiedziami kandydata
    const questionsWithAnswers = await prisma.recruitmentQuestion.findMany({
      where: {
        jobOfferId: application.jobOffer.id
      },
      include: {
        answers: {
          where: {
            applicationForJobOfferId: applicationId
          },
          select: {
            answer: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Formatowanie odpowiedzi
    const formattedQuestions = questionsWithAnswers.map(question => ({
      id: question.id,
      question: question.question,
      currentAnswer: question.answers.length > 0 ? question.answers[0].answer : null
    }));

    res.json({
      applicationId: applicationId,
      jobOfferId: application.jobOffer.id,
      jobOfferName: application.jobOffer.name,
      questions: formattedQuestions,
      canEdit: application.status === 'PENDING'
    });

  } catch (error) {
    console.error('Błąd podczas pobierania pytań:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});
