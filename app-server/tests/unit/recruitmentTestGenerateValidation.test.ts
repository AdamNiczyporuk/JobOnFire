import { recruitmentTestGenerateValidation } from '../../src/validation/recruitmentTestValidation';

describe('Recruitment Test Generate Validation', () => {
  test('rejects invalid difficulty', () => {
    const { error } = recruitmentTestGenerateValidation.validate({ jobOfferId: 1, difficulty: 'ultra' });
    expect(error).toBeDefined();
  });

  test('accepts boundary numQuestions', () => {
    const { error } = recruitmentTestGenerateValidation.validate({ jobOfferId: 1, numQuestions: 50 });
    expect(error).toBeUndefined();
  });

  test('rejects too many numQuestions', () => {
    const { error } = recruitmentTestGenerateValidation.validate({ jobOfferId: 1, numQuestions: 51 });
    expect(error).toBeDefined();
  });
});
