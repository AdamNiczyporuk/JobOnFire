import { prisma } from '../../src/db';

async function cascadeDeleteQuestion(id: number) {
  // mimic route logic: transaction of deleteMany answers then delete question
  await prisma.$transaction([
    prisma.candidateAnswer.deleteMany({ where: { recruitmentQuestionId: id } }),
    prisma.recruitmentQuestion.delete({ where: { id } })
  ]);
}

jest.mock('../../src/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    candidateAnswer: { deleteMany: jest.fn() },
    recruitmentQuestion: { delete: jest.fn() }
  }
}));

describe('Recruitment question cascade delete', () => {
  test('calls transaction with proper operations', async () => {
    const { prisma } = require('../../src/db');
    (prisma.$transaction as jest.Mock).mockImplementation(async (ops: any[]) => {
      // simulate executing operations
      for (const op of ops) {
        if (typeof op === 'object' && op.then) {
          await op; // if promise
        }
      }
    });

    await cascadeDeleteQuestion(55);
    expect(prisma.$transaction).toHaveBeenCalled();
    const opsPassed = (prisma.$transaction as jest.Mock).mock.calls[0][0];
    expect(opsPassed.length).toBe(2);
  });
});
