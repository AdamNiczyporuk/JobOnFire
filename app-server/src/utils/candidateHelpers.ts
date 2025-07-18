import { prisma } from '../db';
import { UserRole } from '@prisma/client';

/**
 * Sprawdza czy użytkownik istnieje i ma rolę CANDIDATE
 */
export const ensureCandidateExists = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { candidateProfile: true }
  });

  if (!user) {
    throw new Error('Użytkownik nie istnieje');
  }

  if (user.role !== UserRole.CANDIDATE) {
    throw new Error('Użytkownik nie ma uprawnień kandydata');
  }

  return user;
};

/**
 * Pobiera profil kandydata wraz z powiązanymi danymi
 */
export const getCandidateProfileWithDetails = async (userId: number) => {
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          registerDate: true
        }
      },
      candidateCVs: true,
      profileLinks: true,
      applications: {
        include: {
          jobOffer: {
            include: {
              employerProfile: {
                select: {
                  companyName: true,
                  companyImageUrl: true
                }
              }
            }
          }
        }
      }
    }
  });

  return candidateProfile;
};

/**
 * Tworzy lub aktualizuje profil kandydata
 */
export const upsertCandidateProfile = async (userId: number, profileData: any) => {
  // Sprawdź czy użytkownik istnieje i ma odpowiednią rolę
  await ensureCandidateExists(userId);

  // Sprawdź czy profil już istnieje
  const existingProfile = await prisma.candidateProfile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    // Aktualizuj istniejący profil
    return await prisma.candidateProfile.update({
      where: { userId },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });
  } else {
    // Utwórz nowy profil
    return await prisma.candidateProfile.create({
      data: {
        ...profileData,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });
  }
};

/**
 * Formatuje dane profilu kandydata do odpowiedzi API
 */
export const formatCandidateProfileResponse = (profile: any) => {
  return {
    id: profile.id,
    name: profile.name,
    lastName: profile.lastName,
    description: profile.description,
    birthday: profile.birthday,
    experience: profile.experience || [],
    phoneNumber: profile.phoneNumber,
    skills: profile.skills || [],
    place: profile.place,
    education: profile.education || [],
    userId: profile.userId,
    user: profile.user,
    profileLinks: profile.profileLinks || [],
    candidateCVs: profile.candidateCVs || [],
    applications: profile.applications || []
  };
};

/**
 * Waliduje i formatuje dane doświadczenia
 */
export const validateExperienceData = (experience: any[]) => {
  if (!Array.isArray(experience)) {
    throw new Error('Doświadczenie musi być tablicą');
  }

  return experience.map(exp => ({
    company: exp.company,
    position: exp.position,
    startDate: exp.startDate,
    endDate: exp.endDate || null,
    isCurrent: exp.isCurrent || false,
    description: exp.description || null,
    location: exp.location || null
  }));
};

/**
 * Waliduje i formatuje dane umiejętności
 */
export const validateSkillsData = (skills: any[]) => {
  if (!Array.isArray(skills)) {
    throw new Error('Umiejętności muszą być tablicą');
  }

  const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  return skills.map(skill => {
    if (!validLevels.includes(skill.level)) {
      throw new Error(`Niepoprawny poziom umiejętności: ${skill.level}`);
    }

    return {
      name: skill.name,
      level: skill.level
    };
  });
};

/**
 * Waliduje i formatuje dane wykształcenia
 */
export const validateEducationData = (education: any[]) => {
  if (!Array.isArray(education)) {
    throw new Error('Wykształcenie musi być tablicą');
  }

  return education.map(edu => ({
    institution: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy || null,
    startDate: edu.startDate,
    endDate: edu.endDate || null,
    isCurrent: edu.isCurrent || false,
    description: edu.description || null,
    location: edu.location || null
  }));
};
