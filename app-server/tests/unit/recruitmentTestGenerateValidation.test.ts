import { recruitmentTestGenerateValidation } from '../../src/validation/recruitmentTestValidation';
import { buildTestPrompt } from '../../src/utils/recruitmentTestPrompt';

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

  describe('buildTestPrompt', () => {
    test('includes position, level fallback and JSON markers', () => {
      const prompt = buildTestPrompt('Backend Engineer');
      expect(prompt).toContain('Backend Engineer');
      expect(prompt).toContain('Nie określono');
      expect(prompt).toMatch(/\"questions\": \[/);
      expect(prompt).toContain('JSON');
    });

    test('reflects provided difficulty, count and language', () => {
      const prompt = buildTestPrompt(
        'Data Analyst',
        'Analyze data',
        'SQL, Excel',
        'Reporting',
        'Mid',
        'hard',
        12,
        'en'
      );
      expect(prompt).toContain('Data Analyst');
      expect(prompt).toContain('hard');
      expect(prompt).toContain('12');
      expect(prompt).toContain('in English');
    });
  });
});
