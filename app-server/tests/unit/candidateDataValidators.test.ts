import { validateExperienceData, validateSkillsData, validateEducationData } from '../../src/utils/candidateHelpers';

describe('Candidate data validators', () => {
  test('validateSkillsData throws on invalid level', () => {
    expect(() => validateSkillsData([{ name: 'JS', level: 'BAD' } as any])).toThrow(/Niepoprawny poziom/);
  });

  test('validateSkillsData maps valid levels', () => {
    const res = validateSkillsData([{ name: 'JS', level: 'ADVANCED' }]);
    expect(res[0]).toEqual({ name: 'JS', level: 'ADVANCED' });
  });

  test('validateSkillsData returns empty array for empty input', () => {
    const res = validateSkillsData([]);
    expect(res).toEqual([]);
  });

  test('validateSkillsData throws on missing level', () => {
    expect(() => validateSkillsData([{ name: 'JS' } as any])).toThrow(/Niepoprawny poziom/);
  });

  test('validateSkillsData maps multiple skills', () => {
    const res = validateSkillsData([
      { name: 'JS', level: 'BEGINNER' },
      { name: 'TS', level: 'EXPERT' }
    ]);
    expect(res).toEqual([
      { name: 'JS', level: 'BEGINNER' },
      { name: 'TS', level: 'EXPERT' }
    ]);
  });

  test('validateExperienceData throws when not array', () => {
    expect(() => validateExperienceData(null as any)).toThrow(/musi być tablicą/);
  });

  test('validateEducationData maps optional fields', () => {
    const res = validateEducationData([{ institution: 'Uni', degree: 'BSc', startDate: '2020-01-01', endDate: null } as any]);
    expect(res[0].institution).toBe('Uni');
    expect(res[0].endDate).toBeNull();
  });
});
