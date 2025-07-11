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
router.patch('/:id/toggle-active', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
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
