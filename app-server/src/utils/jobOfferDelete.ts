import { prisma } from '../db';
import { Prisma } from '@prisma/client';

export interface JobOfferDeleteResult {
  mode: 'deactivated' | 'deleted';
  jobOfferId: number;
  applicationCount: number;
}

/**
 * Deletes a job offer fully if it has no applications; otherwise deactivates it.
 * Mirrors logic from route DELETE /job-offers/:id.
 */
export async function deleteOrDeactivateJobOffer(jobOfferId: number): Promise<JobOfferDeleteResult> {
  const applicationCount = await prisma.applicationForJobOffer.count({
    where: { jobOfferId }
  });

  if (applicationCount > 0) {
    await prisma.jobOffer.update({
      where: { id: jobOfferId },
      data: { isActive: false }
    });
    return { mode: 'deactivated', jobOfferId, applicationCount };
  }

  await prisma.$transaction(async (tx) => {
    const qIds = await tx.recruitmentQuestion.findMany({
      where: { jobOfferId },
      select: { id: true }
    });
    const questionIds = qIds.map(q => q.id);
    if (questionIds.length) {
      await tx.candidateAnswer.deleteMany({
        where: { recruitmentQuestionId: { in: questionIds } }
      });
      await tx.recruitmentQuestion.deleteMany({
        where: { id: { in: questionIds } }
      });
    }
    await tx.recruitmentTest.deleteMany({ where: { jobOfferId } });
    await tx.jobOffer.delete({ where: { id: jobOfferId } });
  });

  return { mode: 'deleted', jobOfferId, applicationCount };
}
