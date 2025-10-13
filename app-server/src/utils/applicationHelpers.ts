import { prisma } from '../db';
import { Request, Response } from 'express';

export async function validateCandidateProfile(req: Request, res: Response): Promise<any> {
  if (!req.user?.candidateProfile?.id) {
    res.status(400).json({ message: 'Profil kandydata nie istnieje' });
    return null;
  }
  return req.user.candidateProfile;
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
