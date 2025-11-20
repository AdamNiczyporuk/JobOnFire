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

  test('fully deletes with questions & candidate answers cascade', async () => {
    (prisma.applicationForJobOffer.count as jest.Mock).mockResolvedValueOnce(0);
    const qIds = [{ id: 201 }, { id: 202 }];
    (prisma.recruitmentQuestion.findMany as jest.Mock).mockResolvedValueOnce(qIds);
    const jobOfferDeleteMock = jest.fn();
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn({
      recruitmentQuestion: prisma.recruitmentQuestion,
      candidateAnswer: prisma.candidateAnswer,
      recruitmentTest: prisma.recruitmentTest,
      jobOffer: { delete: jobOfferDeleteMock }
    }));
    await deleteOrDeactivateJobOffer(12);
    expect(prisma.recruitmentQuestion.findMany).toHaveBeenCalledWith({
      where: { jobOfferId: 12 },
      select: { id: true }
    });
    expect(prisma.candidateAnswer.deleteMany).toHaveBeenCalledWith({
      where: { recruitmentQuestionId: { in: [201, 202] } }
    });
    expect(prisma.recruitmentQuestion.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [201, 202] } }
    });
    expect(prisma.recruitmentTest.deleteMany).toHaveBeenCalledWith({ where: { jobOfferId: 12 } });
    expect(jobOfferDeleteMock).toHaveBeenCalledWith({ where: { id: 12 } });
  });
});
