import { prisma } from '../db';

export async function ensureRecruitmentTestUnique(jobOfferId: number) {
  const existing = await prisma.recruitmentTest.findUnique({ where: { jobOfferId } });
  if (existing) {
    const error: any = new Error('Test already exists for this job offer');
    error.code = 'RECRUITMENT_TEST_EXISTS';
    throw error;
  }
}

export async function createRecruitmentTest(jobOfferId: number, testJson: any) {
  await ensureRecruitmentTestUnique(jobOfferId);
  return prisma.recruitmentTest.create({
    data: { jobOfferId, testJson }
  });
}
