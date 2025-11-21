import { candidateService } from '@/services/candidateService';
import api from '@/api';

describe('candidateService', () => {
  beforeEach(() => {
    (api.put as jest.Mock).mockReset();
  });

  test('updateProfile returns updated candidate profile', async () => {
    (api.put as jest.Mock).mockResolvedValueOnce({ data: { profile: { id: 1, name: 'Ann' } } });
    const candidate = await candidateService.updateProfile({ name: 'Ann' } as any);
    expect(candidate?.name).toBe('Ann');
    expect(api.put).toHaveBeenCalledWith('/candidate/profile', { name: 'Ann' });
  });

  test('updateProfile error propagates rejection', async () => {
    (api.put as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(candidateService.updateProfile({ name: 'X' } as any)).rejects.toThrow('fail');
  });
});
