import { Router, Request, Response } from 'express';
import { prisma } from '../db';
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

// Wszystkie trasy wymagają autoryzacji
router.use(ensureAuthenticated);

/**
 * GET /candidate/profile
 * Pobiera profil aktualnie zalogowanego kandydata
 */
router.get('/profile', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
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
router.put('/profile', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
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
router.get('/profile/stats', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
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

// Endpoint - Pobranie wszystkich CV kandydata
router.get('/cvs', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        candidateCVs: {
          select: {
            id: true,
            name: true,
            cvUrl: true,
            cvJson: true
          },
          orderBy: {
            id: 'desc'
          }
        }
      }
    });

    if (!candidateProfile) {
      res.status(404).json({ message: 'Profil kandydata nie został znaleziony' });
      return;
    }

    res.json({ cvs: candidateProfile.candidateCVs });
  } catch (error) {
    console.error('Błąd podczas pobierania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania CV' });
  }
});

// Endpoint - Pobranie szczegółów konkretnego CV
router.get('/cvs/:id', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const cvId = parseInt(req.params.id);
    
    if (!cvId || isNaN(cvId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID CV' });
      return;
    }

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user!.id },
      select: { id: true }
    });

    if (!candidateProfile) {
      res.status(404).json({ message: 'Profil kandydata nie został znaleziony' });
      return;
    }

    const cv = await prisma.candidateCV.findFirst({
      where: {
        id: cvId,
        candidateProfileId: candidateProfile.id
      },
      select: {
        id: true,
        name: true,
        cvUrl: true,
        cvJson: true
      }
    });

    if (!cv) {
      res.status(404).json({ message: 'CV nie zostało znalezione' });
      return;
    }

    res.json({ cv });
  } catch (error) {
    console.error('Błąd podczas pobierania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania CV' });
  }
});

/**
 * GET /candidates
 * Pobiera listę wszystkich kandydatów z możliwością filtrowania
 * Query params: experience, skills, place, education, page, limit
 */
router.get('/candidates', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      experience,
      skills,
      place,
      education,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Budowanie warunków filtrowania
    const whereConditions: any = {
      user: {
        isDeleted: false
      }
    };

    if (place) {
      whereConditions.place = {
        contains: place as string,
        mode: 'insensitive'
      };
    }

    // Filtrowanie po JSON polach - używamy raw query dla lepszej wydajności
    let rawWhereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (experience) {
      rawWhereConditions.push(`experience::text ILIKE $${paramIndex}`);
      queryParams.push(`%${experience}%`);
      paramIndex++;
    }

    if (skills) {
      rawWhereConditions.push(`skills::text ILIKE $${paramIndex}`);
      queryParams.push(`%${skills}%`);
      paramIndex++;
    }

    if (education) {
      rawWhereConditions.push(`education::text ILIKE $${paramIndex}`);
      queryParams.push(`%${education}%`);
      paramIndex++;
    }

    let candidates;
    let totalCount;

    if (rawWhereConditions.length > 0) {
      // Używamy raw query dla filtrowania JSON pól
      const whereClause = rawWhereConditions.join(' AND ');
      const baseQuery = `
        FROM "candidateProfile" cp
        JOIN "user" u ON cp."userId" = u.id
        WHERE u."isDeleted" = false
        ${place ? `AND cp.place ILIKE '%${place}%'` : ''}
        ${whereClause ? `AND ${whereClause}` : ''}
      `;

      const countResult = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) ${baseQuery}`,
        ...queryParams
      );
      totalCount = parseInt((countResult as any)[0].count);

      const candidatesResult = await prisma.$queryRawUnsafe(
        `
        SELECT 
          cp.id,
          cp.name,
          cp."lastName",
          cp.description,
          cp.place,
          cp.experience,
          cp.skills,
          cp.education,
          u.email
        ${baseQuery}
        ORDER BY cp.id DESC
        LIMIT ${limitNum} OFFSET ${skip}
        `,
        ...queryParams
      );

      candidates = candidatesResult;
    } else {
      // Standardowe query bez filtrowania JSON
      totalCount = await prisma.candidateProfile.count({
        where: whereConditions
      });

      candidates = await prisma.candidateProfile.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          lastName: true,
          description: true,
          place: true,
          experience: true,
          skills: true,
          education: true,
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy: {
          id: 'desc'
        },
        skip,
        take: limitNum
      });
    }

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      candidates,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Błąd podczas pobierania listy kandydatów:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania listy kandydatów' });
  }
});

/**
 * GET /candidates/:id
 * Pobiera szczegółowy profil konkretnego kandydata
 */
router.get('/candidates/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = parseInt(req.params.id);
    
    if (!candidateId || isNaN(candidateId)) {
      res.status(400).json({ message: 'Nieprawidłowe ID kandydata' });
      return;
    }

    const candidate = await prisma.candidateProfile.findFirst({
      where: {
        id: candidateId,
        user: {
          isDeleted: false
        }
      },
      include: {
        user: {
          select: {
            email: true,
            registerDate: true
          }
        },
        profileLinks: {
          select: {
            id: true,
            name: true,
            url: true
          }
        },
        candidateCVs: {
          select: {
            id: true,
            name: true,
            cvUrl: true
          },
          orderBy: {
            id: 'desc'
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            jobOffer: {
              select: {
                id: true,
                name: true,
                employerProfile: {
                  select: {
                    companyName: true
                  }
                }
              }
            }
          },
          orderBy: {
            id: 'desc'
          },
          take: 10 // Ostatnie 10 aplikacji
        }
      }
    });

    if (!candidate) {
      res.status(404).json({ message: 'Kandydat nie został znaleziony' });
      return;
    }

    const formattedCandidate = formatCandidateProfileResponse(candidate);

    res.json({ candidate: formattedCandidate });

  } catch (error) {
    console.error('Błąd podczas pobierania profilu kandydata:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania profilu kandydata' });
  }
});

export default router;
