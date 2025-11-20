import { deleteOrDeactivateJobOffer } from '../../src/utils/jobOfferDelete';

jest.mock('../../src/db', () => ({
  prisma: {
    applicationForJobOffer: { count: jest.fn() },
    jobOffer: { update: jest.fn() },
    $transaction: jest.fn(),
    recruitmentQuestion: { findMany: jest.fn(), deleteMany: jest.fn() },
    candidateAnswer: { deleteMany: jest.fn() },
    recruitmentTest: { deleteMany: jest.fn() }
  }
}));

import { prisma } from '../../src/db';

describe('deleteOrDeactivateJobOffer helper', () => {
  test('deactivates when applications exist', async () => {
    (prisma.applicationForJobOffer.count as jest.Mock).mockResolvedValueOnce(5);
    const result = await deleteOrDeactivateJobOffer(10);
    expect(result.mode).toBe('deactivated');
    expect(prisma.jobOffer.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { isActive: false }
    });
  });

  test('fully deletes when no applications', async () => {
    (prisma.applicationForJobOffer.count as jest.Mock).mockResolvedValueOnce(0);
    (prisma.recruitmentQuestion.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      // emulate transaction callback shape
      return fn({
        recruitmentQuestion: prisma.recruitmentQuestion,
        candidateAnswer: prisma.candidateAnswer,
        recruitmentTest: prisma.recruitmentTest,
        jobOffer: { delete: jest.fn() }
      });
    });
    const result = await deleteOrDeactivateJobOffer(11);
    expect(result.mode).toBe('deleted');
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
