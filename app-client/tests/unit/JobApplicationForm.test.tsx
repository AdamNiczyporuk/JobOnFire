import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobApplicationForm from '@/components/JobApplicationForm';
jest.mock('next/link', () => ({ children }: any) => <span>{children}</span>);

jest.mock('@/context/authContext', () => ({
  useAuth: () => ({ user: { username: 'A', role: 'CANDIDATE' }, isLoading: false })
}));

jest.mock('@/components/ui/toast', () => ({ useToast: () => ({ addToast: jest.fn() }) }));
const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

jest.mock('@/services/candidateService', () => ({ candidateService: { getCVs: jest.fn() } }));
jest.mock('@/services/applicationService', () => ({
  createApplication: jest.fn(),
  checkApplicationStatus: jest.fn(),
  deleteApplication: jest.fn()
}));
jest.mock('@/services/jobOfferService', () => ({ getJobOfferQuestions: jest.fn() }));

import { candidateService } from '@/services/candidateService';
import { createApplication } from '@/services/applicationService';
const { checkApplicationStatus } = require('@/services/applicationService');
import { getJobOfferQuestions } from '@/services/jobOfferService';

const jobOffer = { id: 7, name: 'Frontend Dev', employerProfile: { companyName: 'Firma' } } as any;

describe('JobApplicationForm', () => {
  beforeEach(() => {
    (candidateService.getCVs as jest.Mock).mockReset();
    (createApplication as jest.Mock).mockReset();
    (getJobOfferQuestions as jest.Mock).mockReset();
    (getJobOfferQuestions as jest.Mock).mockResolvedValue([]);
    (checkApplicationStatus as jest.Mock).mockReset();
    (checkApplicationStatus as jest.Mock).mockResolvedValue({ hasApplied: false, applicationId: null });
  });

  test('redirects to CV generator when selecting new CV', async () => {
    (candidateService.getCVs as jest.Mock).mockResolvedValue([{ id: 11, name: 'CV1' }]);
    const { container } = render(<JobApplicationForm jobOffer={jobOffer} onSuccess={() => {}} onCancel={() => {}} />);
    // Wait for CVs select
    await waitFor(() => expect(screen.getByText(/CV1/)).toBeInTheDocument());
    // Click generator box
    fireEvent.click(screen.getByText(/Utwórz nowe CV dla tej oferty/));
    fireEvent.click(screen.getByRole('button', { name: /Stwórz CV/i }));
    expect(push).toHaveBeenCalledWith('/tools/cv-generator?jobOfferId=7');
  });

  test('shows error when no CV selected and none available', async () => {
    (candidateService.getCVs as jest.Mock).mockResolvedValue([]);
    render(<JobApplicationForm jobOffer={jobOffer} onSuccess={() => {}} onCancel={() => {}} />);
    await waitFor(() => expect(screen.getByText(/Nie masz żadnego zapisanego CV/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Wyślij aplikację/i }));
    expect(await screen.findByText(/Proszę wybrać CV/)).toBeInTheDocument();
    expect(createApplication).not.toHaveBeenCalled();
  });

  test('filters empty answers before createApplication', async () => {
    (candidateService.getCVs as jest.Mock).mockResolvedValue([{ id: 11, name: 'CV1' }]);
    (getJobOfferQuestions as jest.Mock).mockResolvedValue([
      { id: 1, question: 'Q1' },
      { id: 2, question: 'Q2' }
    ]);
    (createApplication as jest.Mock).mockResolvedValue({});
    render(<JobApplicationForm jobOffer={jobOffer} onSuccess={() => {}} onCancel={() => {}} />);
    await waitFor(() => expect(screen.getByText(/Q1/)).toBeInTheDocument());
    // Select CV
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '11' } });
    // Answer only first question
    fireEvent.change(screen.getByLabelText(/1\. Q1/), { target: { value: 'Answer1' } });
    fireEvent.click(screen.getByRole('button', { name: /Wyślij aplikację/i }));
    await waitFor(() => expect(createApplication).toHaveBeenCalled());
    const payload = (createApplication as jest.Mock).mock.calls[0][0];
    expect(payload.answers.length).toBe(1);
    expect(payload.answers[0].answer).toBe('Answer1');
  });
});
