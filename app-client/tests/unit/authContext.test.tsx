import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '@/context/authContext';
import api from '@/api';

const Consumer = () => {
  const { user, isLoading, setUser } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'done'}</span>
      <span data-testid="username">{user?.username || 'none'}</span>
      <button onClick={() => setUser({ username: 'Manual', role: 'CANDIDATE' })}>SetManual</button>
    </div>
  );
};

describe('authContext', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockReset();
  });

  test('loads user from /auth/me', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: { user: { username: 'Anna', role: 'CANDIDATE' } } });
    render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('done'));
    expect(screen.getByTestId('username').textContent).toBe('Anna');
  });

  test('sets null when /auth/me fails', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));
    render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('done'));
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  test('manual setUser works', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));
    render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('done'));
    screen.getByText('SetManual').click();
    await waitFor(() => expect(screen.getByTestId('username').textContent).toBe('Manual'));
  });
});
