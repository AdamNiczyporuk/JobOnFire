import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureCandidate } from '../auth/ensureCandidate';
import { candidateProfileUpdateValidation } from '../validation/candidateValidation';
import {
  ensureCandidateExists,
  getCandidateProfileWithDetails,
  upsertCandidateProfile,
  formatCandidateProfileResponse,
  validateExperienceData,
  validateSkillsData,
  validateEducationData
} from '../utils/candidateHelpers';

export const router = Router();

// Wszystkie trasy wymagają autoryzacji i roli kandydata
router.use(ensureAuthenticated);
router.use(ensureCandidate);

/**
 * GET /candidate/profile
 * Pobiera profil aktualnie zalogowanego kandydata
 */
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    const profile = await getCandidateProfileWithDetails(userId);
    
    if (!profile) {
      res.status(404).json({ message: 'Profil kandydata nie został znaleziony' });
      return;
    }

    const formattedProfile = formatCandidateProfileResponse(profile);
    res.json({ profile: formattedProfile });
  } catch (error) {
    console.error('Błąd podczas pobierania profilu kandydata:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania profilu' });
  }
});

/**
 * PUT /candidate/profile
 * Aktualizuje profil aktualnie zalogowanego kandydata
 */
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Walidacja danych
    const { error, value } = candidateProfileUpdateValidation.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ message: 'Błąd walidacji', errors });
      return;
    }

    // Dodatkowa walidacja i formatowanie dla pól JSON
    const profileData: any = { ...value };

    if (profileData.experience) {
      profileData.experience = validateExperienceData(profileData.experience);
    }

    if (profileData.skills) {
      profileData.skills = validateSkillsData(profileData.skills);
    }

    if (profileData.education) {
      profileData.education = validateEducationData(profileData.education);
    }

    // Aktualizuj profil
    const updatedProfile = await upsertCandidateProfile(userId, profileData);
    const formattedProfile = formatCandidateProfileResponse(updatedProfile);

    res.json({ 
      message: 'Profil kandydata został zaktualizowany',
      profile: formattedProfile 
    });
  } catch (error: any) {
    console.error('Błąd podczas aktualizacji profilu kandydata:', error);
    
    if (error.message.includes('nie istnieje') || error.message.includes('uprawnień')) {
      res.status(403).json({ message: error.message });
      return;
    }
    
    if (error.message.includes('tablicą') || error.message.includes('poziom')) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'Błąd serwera podczas aktualizacji profilu' });
  }
});

/**
 * GET /candidate/profile/stats
 * Pobiera statystyki kandydata (liczba aplikacji, CV itp.)
 */
router.get('/profile/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    const profile = await getCandidateProfileWithDetails(userId);
    
    if (!profile) {
      res.status(404).json({ message: 'Profil kandydata nie został znaleziony' });
      return;
    }

    const stats = {
      totalApplications: profile.applications?.length || 0,
      totalCVs: profile.candidateCVs?.length || 0,
      totalProfileLinks: profile.profileLinks?.length || 0,
      pendingApplications: profile.applications?.filter(app => app.status === 'PENDING').length || 0,
      acceptedApplications: profile.applications?.filter(app => app.status === 'ACCEPTED').length || 0,
      rejectedApplications: profile.applications?.filter(app => app.status === 'REJECTED').length || 0,
      experienceCount: profile.experience ? (Array.isArray(profile.experience) ? profile.experience.length : 0) : 0,
      skillsCount: profile.skills ? (Array.isArray(profile.skills) ? profile.skills.length : 0) : 0,
      educationCount: profile.education ? (Array.isArray(profile.education) ? profile.education.length : 0) : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk kandydata:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania statystyk' });
  }
});
