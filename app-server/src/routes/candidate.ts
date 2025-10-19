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
import cloudinary from '../config/cloudinary';
import { uploadCV } from '../config/multer';
import { Readable } from 'stream';

export const router = Router();

// Funkcja pomocnicza do generowania podpisanego URL z Cloudinary
function getSignedUrl(publicId: string): string {
  try {
    // Używaj dokładnie takiego public_id jak zapisany (bez wymuszania formatu)
    const cleanPublicId = publicId;
    
    // Generuj podpisany URL ważny przez 1 godzinę
    const signedUrl = cloudinary.url(cleanPublicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 godzina
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return '';
  }
}

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
      totalCVs: profile.candidateCVs?.filter(cv => !cv.isDeleted).length || 0,
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

/**
 * POST /candidate/cvs/upload
 * Upload CV jako plik PDF do Cloudinary
 */
router.post('/cvs/upload', ensureCandidate, uploadCV.single('cv'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Nie przesłano pliku CV' });
      return;
    }

    // Dodatkowa weryfikacja sygnatury PDF w buforze ("%PDF")
    const buf = req.file.buffer;
    const isPdfSignature = buf && buf.length > 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46; // %PDF
    if (!isPdfSignature) {
      res.status(400).json({ message: 'Przesłany plik nie jest prawidłowym PDF.' });
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

    // Upload do Cloudinary używając stream z bufora
    const uploadPromise = new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // Zgodnie z dokumentacją: PDF jako raw
          resource_type: 'raw',
          // Organizacja w folderze
          folder: 'cvs',
          // Stabilne ID z rozszerzeniem .pdf, niezależne od podanej nazwy
          public_id: `cv_${candidateProfile.id}_${Date.now()}.pdf`,
          // Ustaw tryb dostępu na 'authenticated' dla kontroli dostępu
          access_mode: 'authenticated',
          // Dla porządku nazwy (nie wpływa na public_id)
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Konwertuj buffer na stream i pipe do Cloudinary
      const bufferStream = Readable.from(req.file!.buffer);
      bufferStream.pipe(uploadStream);
    });

  const uploadResult = await uploadPromise;

    console.log('Cloudinary upload result:', {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format
    });

    // Zapisz w bazie danych public_id i URL
    // Upewnij się, że nazwa w bazie kończy się na .pdf niezależnie od podanej nazwy
    let normalizedName = (req.body.name || req.file.originalname || 'CV').toString().trim();
    // usuń istniejące rozszerzenie i dodaj .pdf
    normalizedName = normalizedName.replace(/\.[^\.]+$/, '');
    normalizedName = normalizedName.length ? `${normalizedName}.pdf` : 'CV.pdf';

    const cv = await prisma.candidateCV.create({
      data: {
        candidateProfileId: candidateProfile.id,
        name: normalizedName,
        cvUrl: uploadResult.secure_url, // Zapisujemy URL
        cvJson: JSON.stringify({ public_id: uploadResult.public_id }) // Zapisujemy public_id dla późniejszego użycia
      }
    });

    res.status(201).json({ 
      message: 'CV zostało pomyślnie przesłane',
      cv: {
        id: cv.id,
        name: cv.name,
        cvUrl: cv.cvUrl
      }
    });
  } catch (error) {
    console.error('Błąd podczas przesyłania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas przesyłania CV' });
  }
});

/**
 * POST /candidate/cvs
 * Zapisanie wygenerowanego CV (JSON) na profilu kandydata
 */
router.post('/cvs', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, cvJson } = req.body;

    if (!name || !cvJson) {
      res.status(400).json({ message: 'Nazwa i dane CV są wymagane' });
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

    // Zapisz CV w bazie danych
    const cv = await prisma.candidateCV.create({
      data: {
        candidateProfileId: candidateProfile.id,
        name: name,
        cvUrl: null, // Brak URL dla wygenerowanego CV
        cvJson: JSON.stringify(cvJson)
      }
    });

    res.status(201).json({ 
      message: 'CV zostało pomyślnie zapisane na profilu',
      cv: {
        id: cv.id,
        name: cv.name,
        cvJson: cv.cvJson
      }
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas zapisywania CV' });
  }
});

// Endpoint - Pobranie wszystkich CV kandydata
router.get('/cvs', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user!.id },
      select: { id: true }
    });

    if (!candidateProfile) {
      res.status(404).json({ message: 'Profil kandydata nie został znaleziony' });
      return;
    }

    const cvs = await prisma.candidateCV.findMany({
      where: { candidateProfileId: candidateProfile.id, isDeleted: false } as any,
      select: { id: true, name: true, cvUrl: true, cvJson: true },
      orderBy: { id: 'desc' }
    });

    // Zwracamy CV z oryginalnym URL - download będzie przez proxy endpoint
    res.json({ cvs });
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
        candidateProfileId: candidateProfile.id,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        cvUrl: true,
        cvJson: true
      }
    } as any);

    if (!cv) {
      res.status(404).json({ message: 'CV nie zostało znalezione' });
      return;
    }

    // Zwracamy CV z oryginalnym URL - download będzie przez proxy endpoint
    res.json({ cv });
  } catch (error) {
    console.error('Błąd podczas pobierania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania CV' });
  }
});

/**
 * GET /candidate/cvs/:id/preview
 * Generuje URL do podglądu CV (bez pobierania)
 */
router.get('/cvs/:id/preview', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
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
        candidateProfileId: candidateProfile.id,
        isDeleted: false
      },
      select: {
        id: true,
        cvUrl: true,
        cvJson: true,
        name: true
      }
    } as any);

    if (!cv) {
      res.status(404).json({ message: 'CV nie zostało znalezione' });
      return;
    }

    // Jeśli nie ma cvUrl ale ma cvJson - zwróć JSON do renderowania
    if (!cv.cvUrl && cv.cvJson) {
      try {
        const cvData = typeof cv.cvJson === 'string' ? JSON.parse(cv.cvJson) : cv.cvJson;
        res.json({ 
          type: 'generated',
          cvData: cvData,
          name: cv.name 
        });
        return;
      } catch (e) {
        console.error('Error parsing cvJson for preview:', e);
        res.status(500).json({ message: 'Błąd parsowania danych CV' });
        return;
      }
    }

    // Jeśli nie ma ani cvUrl ani cvJson
    if (!cv.cvUrl) {
      res.status(404).json({ message: 'CV nie ma dostępnych danych do wyświetlenia' });
      return;
    }

    try {
      // Wyciągnij public_id
      let publicId: string | null = null;
      
      if (cv.cvJson) {
        try {
          const jsonData = typeof cv.cvJson === 'string' ? JSON.parse(cv.cvJson) : cv.cvJson;
          publicId = jsonData.public_id;
        } catch (e) {
          console.error('Error parsing cvJson:', e);
        }
      }
      
      if (!publicId && cv.cvUrl.includes('cloudinary.com')) {
        const urlParts = cv.cvUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex !== -1) {
          let pathParts = urlParts.slice(uploadIndex + 1);
          if (pathParts[0] && pathParts[0].startsWith('v')) {
            pathParts = pathParts.slice(1);
          }
          // Nie usuwamy rozszerzenia .pdf – część public_id dla resource_type 'raw'
          publicId = pathParts.join('/').split('?')[0];
        }
      }

      if (publicId) {
        // Generuj URL do podglądu (bez wymuszania downloadu)
        const previewUrl = cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 godzina
        });

        // JSON mode: zwróć podpisany URL zamiast redirectu
        if ((req.query.mode as string) === 'json') {
          res.json({ url: previewUrl });
          return;
        }

        res.redirect(previewUrl);
        return;
      }
    } catch (error) {
      console.error('Error generating preview URL:', error);
    }

    // Fallback
    res.redirect(cv.cvUrl);
  } catch (error) {
    console.error('Błąd podczas generowania podglądu CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas generowania podglądu CV' });
  }
});

/**
 * GET /candidate/cvs/:id/download
 * Proxy do pobierania CV z Cloudinary
 */
router.get('/cvs/:id/download', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
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
        candidateProfileId: candidateProfile.id,
        isDeleted: false
      },
      select: {
        id: true,
        cvUrl: true,
        cvJson: true,
        name: true
      }
    } as any);

    if (!cv || !cv.cvUrl) {
      res.status(404).json({ message: 'CV nie zostało znalezione' });
      return;
    }

    try {
      // Wyciągnij public_id z cvJson jeśli istnieje
      let publicId: string | null = null;
      
      if (cv.cvJson) {
        try {
          const jsonData = typeof cv.cvJson === 'string' ? JSON.parse(cv.cvJson) : cv.cvJson;
          publicId = jsonData.public_id;
        } catch (e) {
          console.error('Error parsing cvJson:', e);
        }
      }
      
      // Jeśli nie ma public_id w JSON, spróbuj wyciągnąć z URL
      if (!publicId && cv.cvUrl.includes('cloudinary.com')) {
        const urlParts = cv.cvUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex !== -1) {
          let pathParts = urlParts.slice(uploadIndex + 1);
          // Usuń wersję jeśli istnieje (v1234567890)
          if (pathParts[0] && pathParts[0].startsWith('v')) {
            pathParts = pathParts.slice(1);
          }
          // Nie usuwamy rozszerzenia .pdf – część public_id dla resource_type 'raw'
          publicId = pathParts.join('/').split('?')[0];
        }
      }

      if (publicId) {
        console.log('Generating download URL for public_id:', publicId);
        
        // Generuj podpisany URL używając Cloudinary SDK
        const suggestedName = (cv.name || 'cv').replace(/\.[^/.]+$/, '') + '.pdf';
        const signedUrl = cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true,
          flags: 'attachment',
          attachment: suggestedName,
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 godzina
        });

        console.log('Generated signed URL:', signedUrl);

        // JSON mode: zwróć podpisany URL zamiast redirectu
        if ((req.query.mode as string) === 'json') {
          res.json({ url: signedUrl });
          return;
        }

        // Przekieruj do podpisanego URL
        res.redirect(signedUrl);
        return;
      }
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }

    // Fallback - przekieruj do oryginalnego URL
    console.log('Falling back to original URL:', cv.cvUrl);
    res.redirect(cv.cvUrl);
  } catch (error) {
    console.error('Błąd podczas pobierania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania CV' });
  }
});

/**
 * DELETE /candidate/cvs/:id
 * Usuwa CV kandydata (z bazy danych i Cloudinary)
 */
router.delete('/cvs/:id', ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  console.log('🗑️ DELETE /candidate/cvs/:id - Request received');
  console.log('CV ID:', req.params.id);
  console.log('User ID:', req.user?.id);
  
  try {
    const cvId = parseInt(req.params.id);
    
    if (!cvId || isNaN(cvId)) {
      console.log('❌ Invalid CV ID');
      res.status(400).json({ message: 'Nieprawidłowe ID CV' });
      return;
    }

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user!.id },
      select: { id: true }
    });

    if (!candidateProfile) {
      console.log('❌ Candidate profile not found');
      res.status(404).json({ message: 'Profil kandydata nie został znaleziony' });
      return;
    }

    console.log('✅ Candidate profile found:', candidateProfile.id);

    const cv = await prisma.candidateCV.findFirst({
      where: {
        id: cvId,
        candidateProfileId: candidateProfile.id
      }
    });

    if (!cv) {
      console.log('❌ CV not found or does not belong to this candidate');
      res.status(404).json({ message: 'CV nie zostało znalezione' });
      return;
    }

    console.log('✅ CV found:', cv);

    // Sprawdź czy są aplikacje używające tego CV
    const applicationsCount = await prisma.applicationForJobOffer.count({
      where: { cvId: cvId }
    });

    console.log('📊 Applications using this CV:', applicationsCount);

    if (applicationsCount > 0) {
      console.log('❌ Cannot delete - CV is used in applications');
      res.status(400).json({ 
        message: `Nie można usunąć CV - jest używane w ${applicationsCount} aplikacji${applicationsCount === 1 ? '' : 'ach'}. Usuń najpierw powiązane aplikacje.`,
        applicationsCount 
      });
      return;
    }

    // Soft delete: oznacz wpis jako usunięty (plik w Cloudinary pozostaje)
    console.log('🔄 Performing soft delete...');
    await prisma.candidateCV.update({
      where: { id: cvId },
      data: { isDeleted: true } as any
    });

    console.log('✅ CV soft deleted successfully');
    res.json({ message: 'CV zostało oznaczone jako usunięte (plik w Cloudinary pozostaje bez zmian)' });
  } catch (error) {
    console.error('❌ Błąd podczas usuwania CV:', error);
    res.status(500).json({ message: 'Błąd serwera podczas usuwania CV' });
  }
});

/**
 * GET /candidates
 * Pobiera listę wszystkich kandydatów z możliwością filtrowania
 * Query params: search, experience, skills, place, education, page, limit
 */
router.get('/candidates', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
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

    // Wyszukiwanie po imieniu i nazwisku
    if (search) {
      whereConditions.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ];
    }

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

    if (rawWhereConditions.length > 0 || search) {
      // Używamy raw query dla filtrowania JSON pól i wyszukiwania
      const whereClause = rawWhereConditions.join(' AND ');
      const searchClause = search ? `(cp.name ILIKE '%${search}%' OR cp."lastName" ILIKE '%${search}%')` : '';
      
      let conditions = [];
      if (place) conditions.push(`cp.place ILIKE '%${place}%'`);
      if (whereClause) conditions.push(whereClause);
      if (searchClause) conditions.push(searchClause);
      
      const additionalWhere = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
      
      const baseQuery = `
        FROM "candidateProfile" cp
        JOIN "user" u ON cp."userId" = u.id
        WHERE u."isDeleted" = false
        ${additionalWhere}
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
          where: { isDeleted: false } as any,
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
