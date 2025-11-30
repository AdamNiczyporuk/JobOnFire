import { jobOfferCreateValidation } from '../../src/validation/jobOfferValidation';
import { employerProfileEditValidation } from '../../src/validation/employerValidation';
import { recruitmentTestCreateValidation, recruitmentTestGenerateValidation } from '../../src/validation/recruitmentTestValidation';

describe('Validation Schemas', () => {
  test('jobOfferCreateValidation passes with minimal valid data', () => {
    const future = new Date(Date.now() + 86400000);
    const { error } = jobOfferCreateValidation.validate({
      name: 'Backend Developer',
      expireDate: future,
    });
    expect(error).toBeUndefined();
  });

  test('jobOfferCreateValidation fails with short name', () => {
    const future = new Date(Date.now() + 86400000);
    const { error } = jobOfferCreateValidation.validate({ name: 'AB', expireDate: future });
    expect(error).toBeDefined();
    expect(error!.details[0].message).toMatch(/at least 3 characters/);
  });

  test('employerProfileEditValidation fails with empty companyName', () => {
    const { error } = employerProfileEditValidation.validate({ companyName: '' });
    expect(error).toBeDefined();
  });

  test('recruitmentTestCreateValidation requires testJson', () => {
    const { error } = recruitmentTestCreateValidation.validate({ jobOfferId: 1 });
    expect(error).toBeDefined();
  });

  test('recruitmentTestGenerateValidation applies defaults', () => {
    const { error, value } = recruitmentTestGenerateValidation.validate({ jobOfferId: 5 });
    expect(error).toBeUndefined();
    expect(value.difficulty).toBe('medium');
    expect(value.numQuestions).toBe(10);
    expect(value.language).toBe('pl');
  });
});
