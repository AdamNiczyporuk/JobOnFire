import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewTestGenerator from '@/components/InterviewTestGenerator';
jest.mock('next/link', () => ({ children }: any) => <span>{children}</span>);

jest.mock('@/services/questionService', () => ({
  generateQuestionsWithAI: jest.fn()
}));
jest.mock('@/services/applicationService', () => ({
  getCandidateApplications: jest.fn()
}));

import { generateQuestionsWithAI } from '@/services/questionService';
import { getCandidateApplications } from '@/services/applicationService';

describe('InterviewTestGenerator', () => {
  beforeEach(() => {
    (generateQuestionsWithAI as jest.Mock).mockReset();
    (getCandidateApplications as jest.Mock).mockReset();
  });

  test('custom mode validation errors', async () => {
    render(<InterviewTestGenerator />);
    fireEvent.click(screen.getAllByRole('button', { name: /Generuj pytania/ })[0]);
    expect(screen.getByText(/Podaj nazwę stanowiska/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Stanowisko *'), { target: { value: 'Dev' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Generuj pytania/ })[0]);
    expect(screen.getByText(/Wybierz poziom stanowiska/)).toBeInTheDocument();
  });

  test('application mode loads applications and generates', async () => {
    (getCandidateApplications as jest.Mock).mockResolvedValue({ applications: [ { id: 3, status: 'PENDING', jobOffer: { name: 'Offer', employerProfile: { companyName: 'Comp' } } } ] });
    (generateQuestionsWithAI as jest.Mock).mockResolvedValue(['Q1','Q2']);
    render(<InterviewTestGenerator />);
    fireEvent.click(screen.getByText(/Pytania pod moją aplikację/));
    await waitFor(() => expect(getCandidateApplications).toHaveBeenCalled());
    fireEvent.click(screen.getAllByRole('button', { name: /Generuj pytania/ })[0]);
    await waitFor(() => expect(generateQuestionsWithAI).toHaveBeenCalled());
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });
});
