import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobOfferForm from '@/components/JobOfferForm';
jest.mock('next/link', () => ({ children }: any) => <span>{children}</span>);
jest.mock('@/services/jobOfferService', () => ({
  getAvailableLocalizations: jest.fn().mockResolvedValue([])
}));

describe('JobOfferForm', () => {
  const futureDate = () => {
    const d = new Date(Date.now() + 5 * 86400000);
    return d.toISOString().split('T')[0];
  };

  test('validates required name field', async () => {
    const onSubmit = jest.fn();
    render(<JobOfferForm onSubmit={onSubmit} onCancel={() => {}} />);
    // Set expire date so only name error shows
    fireEvent.change(screen.getByLabelText(/Data wygaśnięcia/), { target: { value: futureDate() } });
    fireEvent.click(screen.getByRole('button', { name: /Utwórz ofertę/i }));
    expect(await screen.findByText(/Nazwa oferty jest wymagana/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('expire date must be future', async () => {
    const onSubmit = jest.fn();
    render(<JobOfferForm onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Nazwa oferty/), { target: { value: 'Dev' } });
    // Past date (today counts as not future per logic)
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText(/Data wygaśnięcia/), { target: { value: today } });
    fireEvent.click(screen.getByRole('button', { name: /Utwórz ofertę/i }));
    expect(await screen.findByText(/musi być w przyszłości/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('adds recruitment question', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ id: 99 });
    render(<JobOfferForm onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Nazwa oferty/), { target: { value: 'Dev Offer' } });
    fireEvent.change(screen.getByLabelText(/Data wygaśnięcia/), { target: { value: futureDate() } });
    const textarea = screen.getByPlaceholderText('Dodaj pytanie.');
    fireEvent.change(textarea, { target: { value: 'Jakie masz doświadczenie?' } });
    // Multiple 'Dodaj' buttons exist; recruitment question add is the last one
    const addButtons = screen.getAllByRole('button', { name: 'Dodaj' });
    fireEvent.click(addButtons[addButtons.length - 1]);
    expect(screen.getByText('Jakie masz doświadczenie?')).toBeInTheDocument();
  });
});
