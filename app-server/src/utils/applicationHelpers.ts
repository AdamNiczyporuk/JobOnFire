import { prisma } from '../db';
import { Request, Response } from 'express';

export async function validateCandidateProfile(req: Request, res: Response): Promise<any> {
  try {
    // Jeśli profil jest już w sesji, zwróć
    if (req.user?.candidateProfile?.id) {
      return req.user.candidateProfile;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Użytkownik nie jest zalogowany' });
      return null;
    }

    // Spróbuj pobrać profil z bazy po userId
    let profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      // Jeżeli profil nie istnieje, utwórz pusty i zwróć (zapobiega błędom przy świeżych kontach)
      profile = await prisma.candidateProfile.create({ data: { userId: req.user.id } });
    }

    // Zaktualizuj sesję (opcjonalnie)
    (req.user as any).candidateProfile = profile;
    return profile;
  } catch (e) {
    console.error('validateCandidateProfile error:', e);
    res.status(500).json({ message: 'Błąd serwera podczas walidacji profilu kandydata' });
    return null;
  }
}

export async function validateJobOfferExists(jobOfferId: number, res: Response): Promise<any> {
  const jobOffer = await prisma.jobOffer.findFirst({
    where: {
      id: jobOfferId,
      isActive: true,
      expireDate: {
        gte: new Date()
      }
    },
    include: {
      questions: true,
      employerProfile: {
        select: {
          id: true,
          companyName: true
        }
      }
    }
  });

  if (!jobOffer) {
    res.status(404).json({ message: 'Oferta pracy nie istnieje lub nie jest aktywna' });
    return null;
  }

  return jobOffer;
}

export async function validateCandidateCV(candidateProfileId: number, cvId: number, res: Response): Promise<any> {
  const cv = await prisma.candidateCV.findFirst({
    where: {
      id: cvId,
      candidateProfileId: candidateProfileId
    }
  });

  if (!cv) {
    res.status(404).json({ message: 'CV nie zostało znalezione lub nie należy do tego kandydata' });
    return null;
  }

  return cv;
}

export async function validateApplicationExists(applicationId: number, candidateProfileId: number, res: Response): Promise<any> {
  const application = await prisma.applicationForJobOffer.findFirst({
    where: {
      id: applicationId,
      candidateProfileId: candidateProfileId
    },
    include: {
      jobOffer: {
        include: {
          employerProfile: {
            select: {
              id: true,
              companyName: true
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
          question: true
        }
      },
      response: true,
      meetings: {
        orderBy: {
          dateTime: 'desc'
        }
      }
    }
  });

  if (!application) {
    res.status(404).json({ message: 'Aplikacja nie została znaleziona' });
    return null;
  }

  return application;
}

export async function checkDuplicateApplication(candidateProfileId: number, jobOfferId: number, res: Response): Promise<boolean> {
  const existingApplication = await prisma.applicationForJobOffer.findFirst({
    where: {
      candidateProfileId: candidateProfileId,
      jobOfferId: jobOfferId
    }
  });

  if (existingApplication) {
    res.status(400).json({ message: 'Już wysłałeś aplikację na tę ofertę pracy' });
    return true;
  }

  return false;
}
