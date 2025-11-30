import api from '@/api';
import { externalJobOfferService } from '@/services/externalJobOfferService';

jest.mock('@/api');

describe('externalJobOfferService', () => {
  beforeEach(() => {
    (api.get as jest.Mock)?.mockReset?.();
    (api.post as jest.Mock)?.mockReset?.();
    (api.put as jest.Mock)?.mockReset?.();
    (api.delete as jest.Mock)?.mockReset?.();
  });

  test('list calls correct endpoint', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { items: [] } });
    await externalJobOfferService.list();
    expect(api.get).toHaveBeenCalledWith('/external-job-offers');
  });

  test('create passes data', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    await externalJobOfferService.create({ name: 'Ext', url: 'https://a' } as any);
    expect(api.post).toHaveBeenCalledWith('/external-job-offers', { name: 'Ext', url: 'https://a' });
  });

  test('remove calls delete endpoint', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });
    await externalJobOfferService.remove(9);
    expect(api.delete).toHaveBeenCalledWith('/external-job-offers/9');
  });
});
