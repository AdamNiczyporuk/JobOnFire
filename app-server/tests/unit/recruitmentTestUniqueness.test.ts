import { ensureRecruitmentTestUnique, createRecruitmentTest } from '../../src/utils/recruitmentTestHelpers';

jest.mock('../../src/db', () => ({
  prisma: {
    recruitmentTest: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}));

import { prisma } from '../../src/db';

describe('Recruitment test uniqueness helpers', () => {
  test('ensureRecruitmentTestUnique throws when exists', async () => {
    (prisma.recruitmentTest.findUnique as jest.Mock).mockResolvedValueOnce({ id: 1, jobOfferId: 5 });
    await expect(ensureRecruitmentTestUnique(5)).rejects.toMatchObject({ code: 'RECRUITMENT_TEST_EXISTS' });
  });

  test('createRecruitmentTest creates when non existent', async () => {
    (prisma.recruitmentTest.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.recruitmentTest.create as jest.Mock).mockResolvedValueOnce({ id: 10, jobOfferId: 7, testJson: {} });
    const created = await createRecruitmentTest(7, {});
    expect(created).toEqual({ id: 10, jobOfferId: 7, testJson: {} });
  });
});
