import { Router, Request, Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureEmployer } from '../auth/ensureEmployer';
import { prisma } from '../db';
import { employerProfileEditValidation } from '../validation/employerValidation';
import { addressValidation } from '../validation/addressValidation';
import { uploadImage } from '../config/multer';
import cloudinary from '../config/cloudinary';

export const router = Router();
// Statystyki pracodawcy (liczby ofert i aplikacji)
router.get('/stats', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.employerProfile || !user.employerProfile.id) {
      res.status(400).json({ message: 'Employer profile not found for this user.' });
      return;
    }

    const employerProfileId = user.employerProfile.id;

    // Liczba ofert
    const [
      totalJobOffers,
      activeJobOffers,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      prisma.jobOffer.count({ where: { employerProfileId } }),
      prisma.jobOffer.count({ where: { employerProfileId, isActive: true } }),
      prisma.applicationForJobOffer.count({
        where: { jobOffer: { employerProfileId } },
      }),
      prisma.applicationForJobOffer.count({
        where: { status: ApplicationStatus.PENDING, jobOffer: { employerProfileId } },
      }),
      prisma.applicationForJobOffer.count({
        where: { status: ApplicationStatus.ACCEPTED, jobOffer: { employerProfileId } },
      }),
      prisma.applicationForJobOffer.count({
        where: { status: ApplicationStatus.REJECTED, jobOffer: { employerProfileId } },
      }),
    ]);

    res.status(200).json({
      totalJobOffers,
      activeJobOffers,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    });
  } catch (err) {
    console.error('Employer stats fetch error:', err);
    res.status(500).json({ message: 'Error fetching employer stats', error: err });
  }
});
// Edycja profilu pracodawcy
router.put('/profile', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { error, value } = employerProfileEditValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }
    const updateData = { ...value };
    if (Array.isArray(value.industry)) updateData.industry = value.industry;
    if (Array.isArray(value.contractType)) updateData.contractType = value.contractType;
    if (Array.isArray(value.benefits)) updateData.benefits = value.benefits;
    if (updateData.address) delete updateData.address;
    const updated = await prisma.employerProfile.update({
      where: { userId: user.id },
      data: updateData,
    });
    res.status(200).json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Employer profile update error:', err);
    res.status(500).json({ message: 'Error updating employer profile', error: err });
  }
});
// Pobranie profilu pracodawcy
router.get('/profile', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: user.id },
      include: {
        lokalizations: {
          include: { lokalization: true }
        }
      }
    });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    const sanitizedProfile = {
      ...profile,
      userId: undefined,
      lokalizations: profile.lokalizations.map((l) => {
        const { employerProfileId, lokalizationId, ...rest } = l;
        return {
          ...rest,
          lokalization: l.lokalization ? l.lokalization : undefined 
        };
      })
    };
    res.status(200).json({ profile: sanitizedProfile });
  } catch (err) {
    console.error('Employer profile fetch error:', err);
    res.status(500).json({ message: 'Error fetching employer profile', error: err });
  }
});
// Dodaj lokalizację do profilu pracodawcy
router.post('/profile/location', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.employerProfile || !user.employerProfile.id) {
      res.status(400).json({ message: 'Employer profile not found for this user.' });
      return;
    }
    // Walidacja adresu
    const { error, value } = addressValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }
    const { city, state, street, postalCode, latitude, longtitude } = value;
    // Tworzymy nową lokalizację
    const lokalization = await prisma.lokalization.create({
      data: { city, state, street, postalCode, latitude, longtitude }
    });
    // Przypisujemy lokalizację do profilu pracodawcy
    await prisma.lokalizationToEmployerProfile.create({
      data: {
        employerProfileId: user.employerProfile.id,
        lokalizationId: lokalization.id
      }
    });
    res.status(201).json({ message: 'Location added', lokalization });
  } catch (err) {
    console.error('Add location error:', err);
    res.status(500).json({ message: 'Error adding location', error: err });
  }
});
// Usuń lokalizację z profilu pracodawcy
router.delete('/profile/location/:lokalizationId', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.employerProfile || !user.employerProfile.id) {
      res.status(400).json({ message: 'Employer profile not found for this user.' });
      return;
    }
    const lokalizationId = parseInt(req.params.lokalizationId, 10);
    await prisma.lokalizationToEmployerProfile.deleteMany({
      where: {
        employerProfileId: user.employerProfile.id,
        lokalizationId
      }
    });
    res.status(200).json({ message: 'Location removed' });
  } catch (err) {
    console.error('Remove location error:', err);
    res.status(500).json({ message: 'Error removing location', error: err });
  }
});
// Pobierz dostępne lokalizacje dla pracodawcy
router.get('/profile/locations', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.employerProfile || !user.employerProfile.id) {
      res.status(400).json({ message: 'Employer profile not found for this user.' });
      return;
    }

    // Pobierz lokalizacje przypisane do pracodawcy
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { id: user.employerProfile.id },
      include: {
        lokalizations: {
          include: { lokalization: true }
        }
      }
    });

    if (!employerProfile) {
      res.status(404).json({ message: 'Employer profile not found' });
      return;
    }

    const localizations = employerProfile.lokalizations.map(l => l.lokalization);
    res.status(200).json({ localizations });
  } catch (err) {
    console.error('Error fetching employer locations:', err);
    res.status(500).json({ message: 'Error fetching locations', error: err });
  }
});

/**
 * POST /employer/profile/upload-logo
 * Upload logo firmy do Cloudinary
 */
router.post('/profile/upload-logo', ensureAuthenticated, ensureEmployer, uploadImage.single('logo'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Nie przesłano pliku obrazu' });
      return;
    }

    const user = req.user!;
    if (!user.employerProfile || !user.employerProfile.id) {
      res.status(400).json({ message: 'Employer profile not found for this user.' });
      return;
    }

    const employerProfileId = user.employerProfile.id;

    // Upload do Cloudinary używając stream z bufora
    const uploadPromise = new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'company_logos',
          public_id: `logo_${employerProfileId}_${Date.now()}`,
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const result = await uploadPromise;

    // Aktualizuj profil pracodawcy z nowym URL logo
    await prisma.employerProfile.update({
      where: { id: employerProfileId },
      data: { companyImageUrl: result.secure_url }
    });

    res.status(200).json({
      message: 'Logo firmy zostało przesłane pomyślnie',
      logoUrl: result.secure_url
    });
  } catch (err) {
    console.error('Error uploading company logo:', err);
    res.status(500).json({ message: 'Błąd podczas przesyłania logo', error: err });
  }
});