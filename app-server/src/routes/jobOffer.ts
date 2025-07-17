import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureEmployer } from '../auth/ensureEmployer';
import { prisma } from '../db';
import { jobOfferCreateValidation, jobOfferUpdateValidation } from '../validation/jobOfferValidation';
import { 
  validateEmployerProfile, 
  validateJobOfferOwnership, 
  validateLokalizationExists 
} from '../utils/employerHelpers';

export const router = Router();

// PUBLICZNY endpoint - Pobranie wszystkich aktywnych ofert pracy z paginacją i filtrowaniem
router.get('/public', async (req: Request, res: Response): Promise<void> => {
  try {
    // Parametry paginacji
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // max 50 na stronę
    const offset = (page - 1) * limit;

    // Parametry filtrowania
    const search = req.query.search as string; // wyszukiwanie w nazwie i opisie
    const contractType = req.query.contractType as string;
    const workingMode = req.query.workingMode as string;
    const workload = req.query.workload as string;
    const city = req.query.city as string;
    const state = req.query.state as string;
    const salaryMin = req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined;
    const salaryMax = req.query.salaryMax ? parseInt(req.query.salaryMax as string) : undefined;
    const tags = req.query.tags as string; // comma-separated tags
    const companyName = req.query.companyName as string;

    // Sortowanie
    const sortBy = req.query.sortBy as string || 'createDate';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Budowanie warunków where
    const whereConditions: any = {
      isActive: true,
      expireDate: {
        gte: new Date() // tylko aktywne oferty (nie wygasłe)
      }
    };

    // Filtrowanie po tekście (nazwa, opis)
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtrowanie po typie kontraktu
    if (contractType) {
      whereConditions.contractType = { contains: contractType, mode: 'insensitive' };
    }

    // Filtrowanie po trybie pracy
    if (workingMode) {
      whereConditions.workingMode = {
        path: '$',
        array_contains: workingMode
      };
    }

    // Filtrowanie po etacie
    if (workload) {
      whereConditions.workload = { contains: workload, mode: 'insensitive' };
    }

    // Filtrowanie po nazwie firmy
    if (companyName) {
      whereConditions.employerProfile = {
        companyName: { contains: companyName, mode: 'insensitive' }
      };
    }

    // Filtrowanie po lokalizacji
    if (city || state) {
      whereConditions.lokalization = {};
      if (city) {
        whereConditions.lokalization.city = { contains: city, mode: 'insensitive' };
      }
      if (state) {
        whereConditions.lokalization.state = { contains: state, mode: 'insensitive' };
      }
    }

    // Filtrowanie po tagach
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereConditions.tags = {
        path: '$',
        array_contains: tagArray
      };
    }

    // Filtrowanie po wynagrodzeniu (zakładając że salary jest stringiem typu "5000-8000")
    if (salaryMin || salaryMax) {
      // To będzie wymagało dodatkowej logiki parsowania salary string
      // Na razie pomijamy, można dodać później
    }

    // Określenie sortowania
    const orderBy: any = {};
    if (sortBy === 'createDate') {
      orderBy.createDate = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'expireDate') {
      orderBy.expireDate = sortOrder;
    } else {
      orderBy.createDate = 'desc'; // domyślne sortowanie
    }

    const [jobOffers, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where: whereConditions,
        include: {
          employerProfile: {
            select: {
              id: true,
              companyName: true,
              companyImageUrl: true,
              industry: true
            }
          },
          lokalization: {
            select: {
              id: true,
              city: true,
              state: true,
              street: true,
              postalCode: true
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.jobOffer.count({
        where: whereConditions
      })
    ]);

    // Dodatkowe statystyki
    const stats = await prisma.jobOffer.aggregate({
      where: whereConditions,
      _count: {
        id: true
      }
    });

    res.status(200).json({
      jobOffers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search: search || null,
        contractType: contractType || null,
        workingMode: workingMode || null,
        workload: workload || null,
        city: city || null,
        state: state || null,
        tags: tags || null,
        companyName: companyName || null,
        sortBy,
        sortOrder
      },
      stats: {
        totalActiveOffers: stats._count.id
      }
    });
  } catch (err) {
    console.error('Error fetching public job offers:', err);
    res.status(500).json({ message: 'Error fetching job offers', error: err });
  }
});

// PUBLICZNY endpoint - Pobranie pojedynczej oferty pracy
router.get('/public/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const jobOfferId = parseInt(req.params.id);

    if (!jobOfferId || isNaN(jobOfferId)) {
      res.status(400).json({ message: 'Invalid job offer ID' });
      return;
    }

    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: jobOfferId,
        isActive: true,
        expireDate: {
          gte: new Date()
        }
      },
      include: {
        employerProfile: {
          select: {
            id: true,
            companyName: true,
            companyImageUrl: true,
            industry: true,
            description: true
          }
        },
        lokalization: {
          select: {
            id: true,
            city: true,
            state: true,
            street: true,
            postalCode: true
          }
        },
        questions: {
          select: {
            id: true,
            question: true
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!jobOffer) {
      res.status(404).json({ message: 'Job offer not found or expired' });
      return;
    }

    res.status(200).json({
      jobOffer
    });
  } catch (err) {
    console.error('Error fetching public job offer:', err);
    res.status(500).json({ message: 'Error fetching job offer', error: err });
  }
});

// Pobranie wszystkich ofert pracy pracodawcy
router.get('/', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Pobierz oferty pracy z paginacją
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [jobOffers, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where: { employerProfileId: employerProfile.id },
        include: {
          lokalization: true,
          applications: {
            select: { id: true }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createDate: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.jobOffer.count({
        where: { employerProfileId: employerProfile.id }
      })
    ]);

    res.status(200).json({
      jobOffers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching job offers:', err);
    res.status(500).json({ message: 'Error fetching job offers', error: err });
  }
});

// Pobranie konkretnej oferty pracy
router.get('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const jobOfferId = parseInt(req.params.id);

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    const jobOffer = await prisma.jobOffer.findFirst({
      where: { 
        id: jobOfferId,
        employerProfileId: employerProfile.id 
      },
      include: {
        lokalization: true,
        applications: {
          include: {
            candidateProfile: {
              select: {
                id: true,
                name: true,
                lastName: true,
                phoneNumber: true
              }
            },
            candidateCV: {
              select: {
                id: true,
                name: true,
                cvUrl: true
              }
            }
          }
        },
        questions: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!jobOffer) {
      res.status(404).json({ message: 'Job offer not found' });
      return;
    }

    res.status(200).json({ jobOffer });
  } catch (err) {
    console.error('Error fetching job offer:', err);
    res.status(500).json({ message: 'Error fetching job offer', error: err });
  }
});

// Utworzenie nowej oferty pracy
router.post('/', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    // Walidacja danych
    const { error, value } = jobOfferCreateValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy lokalizacja istnieje (jeśli podana)
    if (value.lokalizationId) {
      const lokalization = await validateLokalizationExists(value.lokalizationId, res);
      if (!lokalization) return;
    }

    // Utwórz ofertę pracy
    const jobOffer = await prisma.jobOffer.create({
      data: {
        ...value,
        employerProfileId: employerProfile.id,
        createDate: new Date(),
        isActive: true
      },
      include: {
        lokalization: true
      }
    });

    res.status(201).json({ message: 'Job offer created successfully', jobOffer });
  } catch (err) {
    console.error('Error creating job offer:', err);
    res.status(500).json({ message: 'Error creating job offer', error: err });
  }
});

// Aktualizacja oferty pracy
router.put('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const jobOfferId = parseInt(req.params.id);

    // Walidacja danych
    const { error, value } = jobOfferUpdateValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy oferta należy do pracodawcy
    const existingOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
    if (!existingOffer) return;

    // Sprawdź czy lokalizacja istnieje (jeśli podana)
    if (value.lokalizationId) {
      const lokalization = await validateLokalizationExists(value.lokalizationId, res);
      if (!lokalization) return;
    }

    // Aktualizuj ofertę
    const updatedJobOffer = await prisma.jobOffer.update({
      where: { id: jobOfferId },
      data: value,
      include: {
        lokalization: true
      }
    });

    res.status(200).json({ message: 'Job offer updated successfully', jobOffer: updatedJobOffer });
  } catch (err) {
    console.error('Error updating job offer:', err);
    res.status(500).json({ message: 'Error updating job offer', error: err });
  }
});

// Usunięcie oferty pracy
router.delete('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const jobOfferId = parseInt(req.params.id);

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy oferta należy do pracodawcy
    const existingOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
    if (!existingOffer) return;

    // Sprawdź czy oferta ma aplikacje
    const applicationCount = await prisma.applicationForJobOffer.count({
      where: { jobOfferId: jobOfferId }
    });

    if (applicationCount > 0) {
      // Zamiast usuwać, dezaktywuj ofertę
      const deactivatedOffer = await prisma.jobOffer.update({
        where: { id: jobOfferId },
        data: { isActive: false }
      });

      res.status(200).json({ 
        message: 'Job offer deactivated (has applications)', 
        jobOffer: deactivatedOffer 
      });
    } else {
      // Usuń ofertę jeśli nie ma aplikacji
      await prisma.jobOffer.delete({
        where: { id: jobOfferId }
      });

      res.status(200).json({ message: 'Job offer deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting job offer:', err);
    res.status(500).json({ message: 'Error deleting job offer', error: err });
  }
});

// Przełączenie statusu aktywności oferty
router.patch('/:id/toggle-active', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const jobOfferId = parseInt(req.params.id);

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy oferta należy do pracodawcy
    const existingOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
    if (!existingOffer) return;

    // Przełącz status
    const updatedOffer = await prisma.jobOffer.update({
      where: { id: jobOfferId },
      data: { isActive: !existingOffer.isActive }
    });

    res.status(200).json({ 
      message: `Job offer ${updatedOffer.isActive ? 'activated' : 'deactivated'} successfully`, 
      jobOffer: updatedOffer 
    });
  } catch (err) {
    console.error('Error toggling job offer status:', err);
    res.status(500).json({ message: 'Error toggling job offer status', error: err });
  }
});

// GET /:id/applications - Pobranie aplikacji do konkretnej oferty pracy (dla pracodawców)
router.get('/:id/applications', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const jobOfferId = parseInt(req.params.id);
    
    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy oferta należy do pracodawcy
    const jobOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
    if (!jobOffer) return;

    // Parametry paginacji i filtrowania
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    // Budowanie warunków where
    const whereConditions: any = {
      jobOfferId: jobOfferId
    };

    if (status && ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'].includes(status)) {
      whereConditions.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.applicationForJobOffer.findMany({
        where: whereConditions,
        include: {
          candidateProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          candidateCV: {
            select: {
              id: true,
              name: true,
              cvUrl: true
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
      jobOffer: {
        id: jobOffer.id,
        name: jobOffer.name
      },
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

// PUT /:jobId/applications/:applicationId - Aktualizacja statusu aplikacji (dla pracodawców)
router.put('/:jobId/applications/:applicationId', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const jobOfferId = parseInt(req.params.jobId);
    const applicationId = parseInt(req.params.applicationId);

    if (isNaN(jobOfferId) || isNaN(applicationId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID' });
      return;
    }

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy oferta należy do pracodawcy
    const jobOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
    if (!jobOffer) return;

    // Walidacja danych wejściowych
    const { status, response } = req.body;

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Nieprawidłowy status aplikacji' });
      return;
    }

    // Sprawdź czy aplikacja istnieje i należy do tej oferty
    const application = await prisma.applicationForJobOffer.findFirst({
      where: {
        id: applicationId,
        jobOfferId: jobOfferId
      }
    });

    if (!application) {
      res.status(404).json({ message: 'Aplikacja nie została znaleziona' });
      return;
    }

    // Aktualizacja w transakcji
    const updatedApplication = await prisma.$transaction(async (tx) => {
      // Aktualizacja statusu aplikacji
      const updated = await tx.applicationForJobOffer.update({
        where: { id: applicationId },
        data: { status: status }
      });

      // Jeśli podano odpowiedź, dodaj/zaktualizuj ją
      if (response && response.trim()) {
        await tx.applicationResponse.upsert({
          where: { applicationForJobOfferId: applicationId },
          update: { response: response },
          create: {
            applicationForJobOfferId: applicationId,
            response: response
          }
        });
      }

      return updated;
    });

    // Pobranie pełnych danych aplikacji
    const fullApplication = await prisma.applicationForJobOffer.findUnique({
      where: { id: applicationId },
      include: {
        candidateProfile: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        candidateCV: {
          select: {
            id: true,
            name: true,
            cvUrl: true
          }
        },
        response: true,
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
      message: 'Status aplikacji został zaktualizowany',
      application: fullApplication
    });

  } catch (error) {
    console.error('Błąd podczas aktualizacji aplikacji:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /:jobId/applications/stats - Statystyki aplikacji dla konkretnej oferty (dla pracodawców)
router.get('/:id/applications/stats', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const jobOfferId = parseInt(req.params.id);

    // Sprawdź profil pracodawcy
    const employerProfile = await validateEmployerProfile(req, res);
    if (!employerProfile) return;

    // Sprawdź czy oferta należy do pracodawcy
    const jobOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
    if (!jobOffer) return;

    const stats = await prisma.applicationForJobOffer.groupBy({
      by: ['status'],
      where: {
        jobOfferId: jobOfferId
      },
      _count: {
        status: true
      }
    });

    const totalApplications = await prisma.applicationForJobOffer.count({
      where: {
        jobOfferId: jobOfferId
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

    res.json({
      jobOffer: {
        id: jobOffer.id,
        name: jobOffer.name
      },
      stats: formattedStats
    });

  } catch (error) {
    console.error('Błąd podczas pobierania statystyk:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});
