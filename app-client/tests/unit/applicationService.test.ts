import { createApplication } from '@/services/applicationService';
import api from '@/api';

describe('applicationService', () => {
  beforeEach(() => {
    (api.post as jest.Mock).mockReset();
  });

  test('createApplication returns application', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'ok', application: { id: 10, jobOfferId: 7 } } });
    const result = await createApplication({ jobOfferId: 7, cvId: 3 } as any);
    expect(result.application.id).toBe(10);
    expect(api.post).toHaveBeenCalledWith('/applications', { jobOfferId: 7, cvId: 3 });
  });

  test('createApplication error propagates rejection', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('duplicate'));
    await expect(createApplication({ jobOfferId: 7, cvId: 3 } as any)).rejects.toThrow('duplicate');
  });
});
