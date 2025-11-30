import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CookieConsent from '@/components/CookieConsent';
jest.mock('next/link', () => ({ children }: any) => <span>{children}</span>);

const LS_KEY = 'cookie_consent';

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('shows banner when no consent', async () => {
    render(<CookieConsent />);
    await waitFor(() => expect(screen.getByText(/Zgoda na cookies/)).toBeInTheDocument());
  });

  test('hides when consent already stored', async () => {
    localStorage.setItem(LS_KEY, 'accepted');
    render(<CookieConsent />);
    // Wait a tick to ensure effect runs and component stays hidden
    await waitFor(() => expect(screen.queryByText(/Zgoda na cookies/)).toBeNull());
  });

  test('accept button stores consent and hides', async () => {
    render(<CookieConsent />);
    await waitFor(() => expect(screen.getByText(/Zgoda na cookies/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Akceptuję/ }));
    expect(localStorage.getItem(LS_KEY)).toBe('accepted');
    await waitFor(() => expect(screen.queryByText(/Zgoda na cookies/)).toBeNull());
  });
});
