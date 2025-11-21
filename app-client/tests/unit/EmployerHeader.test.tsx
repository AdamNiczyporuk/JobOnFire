import { render, screen } from '@testing-library/react';
import React from 'react';
import { EmployerHeader } from '@/components/EmployerHeader';

jest.mock('next/navigation', () => ({
  usePathname: () => '/employer/dashboard',
  useRouter: () => ({ push: jest.fn() })
}));

// Minimal test just ensures component renders without crashing.
describe('EmployerHeader', () => {
  test('renders without crash', () => {
    render(<EmployerHeader />);
    // Use a more generic assertion if specific text not guaranteed.
    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
