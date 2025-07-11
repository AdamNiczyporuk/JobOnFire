import { Request, Response } from 'express';
import { prisma } from '../db';

/**
 * Sprawdza czy użytkownik jest właścicielem zasobu pracodawcy
 * @param userId - ID użytkownika
 * @returns profil pracodawcy lub null jeśli nie istnieje
 */
export async function getEmployerProfile(userId: number) {
  return await prisma.employerProfile.findUnique({
    where: { userId }
  });
}

/**
 * Sprawdza czy oferta pracy należy do pracodawcy
 * @param jobOfferId - ID oferty pracy
 * @param employerProfileId - ID profilu pracodawcy
 * @returns oferta pracy lub null jeśli nie należy do pracodawcy
 */
export async function verifyJobOfferOwnership(jobOfferId: number, employerProfileId: number) {
  return await prisma.jobOffer.findFirst({
    where: { 
      id: jobOfferId,
      employerProfileId: employerProfileId 
    }
  });
}

/**
 * Sprawdza czy lokalizacja istnieje
 * @param lokalizationId - ID lokalizacji
 * @returns lokalizacja lub null jeśli nie istnieje
 */
export async function verifyLokalizationExists(lokalizationId: number) {
  return await prisma.lokalization.findUnique({
    where: { id: lokalizationId }
  });
}

/**
 * Middleware helper - sprawdza profil pracodawcy i zwraca błąd jeśli nie istnieje
 * @param req - Request object
 * @param res - Response object
 * @returns profil pracodawcy lub wysyła odpowiedź błędu
 */
export async function validateEmployerProfile(req: Request, res: Response) {
  const user = req.user!;
  const employerProfile = await getEmployerProfile(user.id);
  
  if (!employerProfile) {
    res.status(404).json({ message: 'Employer profile not found' });
    return null;
  }
  
  return employerProfile;
}

/**
 * Middleware helper - sprawdza czy oferta należy do pracodawcy
 * @param jobOfferId - ID oferty pracy
 * @param employerProfileId - ID profilu pracodawcy
 * @param res - Response object
 * @returns oferta pracy lub wysyła odpowiedź błędu
 */
export async function validateJobOfferOwnership(jobOfferId: number, employerProfileId: number, res: Response) {
  const jobOffer = await verifyJobOfferOwnership(jobOfferId, employerProfileId);
  
  if (!jobOffer) {
    res.status(404).json({ message: 'Job offer not found or access denied' });
    return null;
  }
  
  return jobOffer;
}

/**
 * Middleware helper - sprawdza czy lokalizacja istnieje
 * @param lokalizationId - ID lokalizacji
 * @param res - Response object
 * @returns lokalizacja lub wysyła odpowiedź błędu
 */
export async function validateLokalizationExists(lokalizationId: number, res: Response) {
  const lokalization = await verifyLokalizationExists(lokalizationId);
  
  if (!lokalization) {
    res.status(404).json({ message: 'Lokalization not found' });
    return null;
  }
  
  return lokalization;
}
