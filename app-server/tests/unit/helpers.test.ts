import { buildAnonymizedIdentifiers, isAnonymizedUsername, isAnonymizedEmail } from '../../src/utils/anonymization';
import { validateJobOfferOwnership, validateLokalizationExists } from '../../src/utils/employerHelpers';

jest.mock('../../src/db', () => ({
  prisma: {
    jobOffer: { findFirst: jest.fn() },
    lokalization: { findUnique: jest.fn() }
  }
}));

import { prisma } from '../../src/db';

describe('Helper & anonymization utilities', () => {
  test('buildAnonymizedIdentifiers produces deterministic pattern with fixed timestamp', () => {
    const fixed = 1730000000000; // arbitrary
    const { username, email } = buildAnonymizedIdentifiers(42, fixed);
    expect(username).toBe(`deleted_user_42_${fixed}`);
    expect(email).toBe(`deleted_42_${fixed}@anonymized.local`);
    expect(isAnonymizedUsername(username)).toBe(true);
    expect(isAnonymizedEmail(email)).toBe(true);
  });

  test('validateJobOfferOwnership returns jobOffer when found', async () => {
    (prisma.jobOffer.findFirst as jest.Mock).mockResolvedValueOnce({ id: 10, employerProfileId: 5 });
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await validateJobOfferOwnership(10, 5, mockRes);
    expect(result).toEqual({ id: 10, employerProfileId: 5 });
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('validateJobOfferOwnership sends 404 when not found', async () => {
    (prisma.jobOffer.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await validateJobOfferOwnership(11, 5, mockRes);
    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('validateLokalizationExists returns entity when found', async () => {
    (prisma.lokalization.findUnique as jest.Mock).mockResolvedValueOnce({ id: 7 });
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await validateLokalizationExists(7, mockRes);
    expect(result).toEqual({ id: 7 });
  });

  test('validateLokalizationExists returns null when missing', async () => {
    (prisma.lokalization.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await validateLokalizationExists(999, mockRes);
    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});
