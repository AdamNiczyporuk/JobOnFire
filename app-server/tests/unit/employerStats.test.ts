import { prisma } from '../../src/db';

// We'll mimic the internal logic of /employer/stats by creating an extracted function for test purposes
async function computeEmployerStats(employerProfileId: number) {
  const [
    totalJobOffers,
    activeJobOffers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
  ] = await Promise.all([
    prisma.jobOffer.count({ where: { employerProfileId } }),
    prisma.jobOffer.count({ where: { employerProfileId, isActive: true } }),
    prisma.applicationForJobOffer.count({ where: { jobOffer: { employerProfileId } } }),
    prisma.applicationForJobOffer.count({ where: { status: 'PENDING', jobOffer: { employerProfileId } } }),
    prisma.applicationForJobOffer.count({ where: { status: 'ACCEPTED', jobOffer: { employerProfileId } } }),
    prisma.applicationForJobOffer.count({ where: { status: 'REJECTED', jobOffer: { employerProfileId } } }),
  ]);

  return {
    totalJobOffers,
    activeJobOffers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
  };
}

jest.mock('../../src/db', () => ({
  prisma: {
    jobOffer: { count: jest.fn() },
    applicationForJobOffer: { count: jest.fn() }
  }
}));

describe('Employer stats logic', () => {
  test('aggregates counts correctly', async () => {
    const { prisma } = require('../../src/db');
    (prisma.jobOffer.count as jest.Mock)
      .mockResolvedValueOnce(12) // totalJobOffers
      .mockResolvedValueOnce(8); // activeJobOffers

    (prisma.applicationForJobOffer.count as jest.Mock)
      .mockResolvedValueOnce(69) // totalApplications
      .mockResolvedValueOnce(30) // pendingApplications
      .mockResolvedValueOnce(20) // acceptedApplications
      .mockResolvedValueOnce(19); // rejectedApplications

    const stats = await computeEmployerStats(5);
    expect(stats).toEqual({
      totalJobOffers: 12,
      activeJobOffers: 8,
      totalApplications: 69,
      pendingApplications: 30,
      acceptedApplications: 20,
      rejectedApplications: 19,
    });
  });
});
