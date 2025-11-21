import React from 'react';
import { render, screen } from '@testing-library/react';
import ToolSidebar from '@/components/ToolSidebar';
import Link from 'next/link';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('ToolSidebar', () => {
  test('renders key tool links', () => {
    render(<ToolSidebar />);
    expect(screen.getByText(/Generator CV/i)).toBeInTheDocument();
    expect(screen.getByText(/Kalkulator wynagrodzeń/i)).toBeInTheDocument();
    expect(screen.getByText(/Pytania na rozmowę/i)).toBeInTheDocument();
  });
});
