import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { prisma } from '../db';
import { employerProfileEditValidation } from '../validation/employerValidation';

export const router = Router();
// Edycja profilu pracodawcy
router.put('/profile', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'EMPLOYER') {
      res.status(403).json({ message: 'Access denied. Only employer can edit his employer profile.' });
      return;
    }
    const { error, value } = employerProfileEditValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }
    // Usuń address z updateData przed zapisem do bazy
    const updateData = { ...value };
    if (Array.isArray(value.industry)) updateData.industry = value.industry;
    if (Array.isArray(value.contractType)) updateData.contractType = value.contractType;
    if (Array.isArray(value.benefits)) updateData.benefits = value.benefits;
    if (updateData.address) delete updateData.address;
    const updated = await prisma.employerProfile.update({
      where: { userId: user.id },
      data: updateData,
    });
    // Obsługa edycji adresu
    if (value.address) {
      const { city, state, street, postalCode, latitude, longtitude } = value.address;
      // Usuwamy stare powiązania lokalizacji
      await prisma.lokalizationToEmployerProfile.deleteMany({ where: { employerProfileId: updated.id } });
      // Tworzymy nową lokalizację
      const lokalization = await prisma.lokalization.create({
        data: { city, state, street, postalCode, latitude, longtitude }
      });
      // Przypisujemy nową lokalizację do profilu pracodawcy
      await prisma.lokalizationToEmployerProfile.create({
        data: {
          employerProfileId: updated.id,
          lokalizationId: lokalization.id
        }
      });
    }
    res.status(200).json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Employer profile update error:', err);
    res.status(500).json({ message: 'Error updating employer profile', error: err });
  }
});