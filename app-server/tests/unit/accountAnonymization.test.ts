import { performAccountAnonymization } from '../../src/utils/anonymization/account';

jest.mock('../../src/db', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    candidateProfile: { update: jest.fn() },
    employerProfile: { update: jest.fn() },
    profileLink: { deleteMany: jest.fn() },
    candidateCV: { updateMany: jest.fn() },
    jobOffer: { updateMany: jest.fn() },
    recruitmentTest: { deleteMany: jest.fn() },
    additionalCredentials: { deleteMany: jest.fn() }
  }
}));

import { prisma } from '../../src/db';

describe('performAccountAnonymization', () => {
  test('returns null when user absent', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const result = await performAccountAnonymization(1);
    expect(result).toBeNull();
  });

  test('anonymizes user with candidate and employer profiles', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 5,
      candidateProfile: { id: 10 },
      employerProfile: { id: 20 }
    });
    const result = await performAccountAnonymization(5);
    expect(result).not.toBeNull();
    expect(prisma.candidateProfile.update).toHaveBeenCalled();
    expect(prisma.profileLink.deleteMany).toHaveBeenCalled();
    expect(prisma.candidateCV.updateMany).toHaveBeenCalled();
    expect(prisma.employerProfile.update).toHaveBeenCalled();
    expect(prisma.jobOffer.updateMany).toHaveBeenCalled();
    expect(prisma.additionalCredentials.deleteMany).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled();
    expect(result!.hadCandidateProfile).toBe(true);
    expect(result!.hadEmployerProfile).toBe(true);
  });
});
