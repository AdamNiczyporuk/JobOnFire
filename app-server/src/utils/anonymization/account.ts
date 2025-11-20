import { prisma } from '../../db';
import { Prisma } from '@prisma/client';
import { buildAnonymizedIdentifiers } from './index';

export interface AccountAnonymizationSummary {
  userId: number;
  hadCandidateProfile: boolean;
  hadEmployerProfile: boolean;
  anonymizedUsername: string;
  anonymizedEmail: string;
}

export async function performAccountAnonymization(userId: number): Promise<AccountAnonymizationSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { candidateProfile: true, employerProfile: true }
  });
  if (!user) return null;

  const { username: anonymizedUsername, email: anonymizedEmail } = buildAnonymizedIdentifiers(userId);

  if (user.candidateProfile) {
    await prisma.candidateProfile.update({
      where: { id: user.candidateProfile.id },
      data: {
        name: null,
        lastName: null,
        description: null,
        birthday: null,
        experience: Prisma.JsonNull,
        phoneNumber: null,
        skills: Prisma.JsonNull,
        place: null,
        education: Prisma.JsonNull
      }
    });
    await prisma.profileLink.deleteMany({ where: { candidateProfileId: user.candidateProfile.id } });
    await prisma.candidateCV.updateMany({
      where: { candidateProfileId: user.candidateProfile.id },
      data: { isDeleted: true }
    });
  }

  if (user.employerProfile) {
    await prisma.employerProfile.update({
      where: { id: user.employerProfile.id },
      data: {
        companyName: `Usunięta firma ${userId}`,
        companyImageUrl: null,
        industry: Prisma.JsonNull,
        description: null,
        contractType: Prisma.JsonNull,
        contactPhone: null,
        contactEmail: null,
        benefits: Prisma.JsonNull
      }
    });
    await prisma.jobOffer.updateMany({
      where: { employerProfileId: user.employerProfile.id },
      data: { isActive: false }
    });
  }

  await prisma.additionalCredentials.deleteMany({ where: { userId } });

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: anonymizedUsername,
      email: anonymizedEmail,
      passwordHash: null,
      isDeleted: true
    }
  });

  return {
    userId,
    hadCandidateProfile: !!user.candidateProfile,
    hadEmployerProfile: !!user.employerProfile,
    anonymizedUsername,
    anonymizedEmail
  };
}
