import api from '@/api';
import { getEmployerStats, updateEmployerProfile, addEmployerProfileLocation, removeEmployerProfileLocation } from '@/services/employerService';

jest.mock('@/api');

describe('employerService', () => {
  beforeEach(() => {
    (api.get as jest.Mock)?.mockReset?.();
    (api.put as jest.Mock)?.mockReset?.();
    (api.post as jest.Mock)?.mockReset?.();
    (api.delete as jest.Mock)?.mockReset?.();
  });

  test('getEmployerStats returns fallback on error', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const stats = await getEmployerStats();
    expect(stats.totalJobOffers).toBe(0);
  });

  test('updateEmployerProfile calls endpoint', async () => {
    (api.put as jest.Mock).mockResolvedValueOnce({ data: { ok: true } });
    await updateEmployerProfile({ companyName: 'X' } as any);
    expect(api.put).toHaveBeenCalledWith('/employer/profile', { companyName: 'X' });
  });

  test('add and remove location', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });
    await addEmployerProfileLocation({ city: 'A' } as any);
    expect(api.post).toHaveBeenCalledWith('/employer/profile/location', { city: 'A' });
    await removeEmployerProfileLocation(5);
    expect(api.delete).toHaveBeenCalledWith('/employer/profile/location/5');
  });
});
