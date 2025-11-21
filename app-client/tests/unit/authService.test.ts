import * as authService from '@/services/authService';
import api from '@/api';

describe('authService', () => {
  beforeEach(() => {
    (api.post as jest.Mock).mockReset();
  });

  test('login returns user data', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { user: { username: 'Anna' } } });
    const result = await authService.login('Anna', 'x', 'CANDIDATE');
    expect(result.user.username).toBe('Anna');
    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'Anna', password: 'x', role: 'CANDIDATE' });
  });

  test('login error propagates rejection', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid'));
    await expect(authService.login('bad', 'x', 'CANDIDATE')).rejects.toThrow('Invalid');
  });

  test('logout calls endpoint', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({});
    await authService.logout();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });
});
