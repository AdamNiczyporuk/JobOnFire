import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CandidateProfileForm } from '@/components/CandidateProfileForm';
jest.mock('next/link', () => ({ children }: any) => <span>{children}</span>);
import { candidateService } from '@/services/candidateService';

jest.mock('@/services/candidateService', () => ({
  candidateService: {
    updateProfile: jest.fn()
  }
}));

const baseProfile = {
  name: 'Jan',
  lastName: 'Kowalski',
  description: '',
  birthday: undefined,
  phoneNumber: undefined,
  place: '',
  experience: [
    { company: 'A', position: 'Dev', startDate: '2024-01', endDate: '2024-06', isCurrent: false, description: '', location: '' },
    { company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '', location: '' }
  ],
  skills: [ { name: 'React', level: 'BEGINNER' }, { name: '', level: 'BEGINNER' } ],
  education: [ { institution: 'UW', degree: 'Lic', fieldOfStudy: '', startDate: '2020-01', endDate: '2023-01', isCurrent: false, description: '', location: '' }, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, description: '', location: '' } ],
  profileLinks: [ { id: 1, name: 'LinkedIn', url: 'https://linkedin.com/x' }, { id: 2, name: 'GitHub', url: '' } ]
} as any;

describe('CandidateProfileForm', () => {
  test('filters empty items before calling updateProfile', async () => {
    (candidateService.updateProfile as jest.Mock).mockResolvedValueOnce({ profile: { name: 'Jan' } });
    const onSuccess = jest.fn();
    const onCancel = jest.fn();
    render(<CandidateProfileForm profile={baseProfile} onSuccess={onSuccess} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Zapisz profil'));

    await waitFor(() => expect(candidateService.updateProfile).toHaveBeenCalled());
    const sent = (candidateService.updateProfile as jest.Mock).mock.calls[0][0];
    // Empty experience/skills/education filtered out
    expect(sent.experience.length).toBe(1);
    expect(sent.skills.length).toBe(1);
    expect(sent.education.length).toBe(1);
    // Empty link removed
    expect(sent.profileLinks.length).toBe(1);
    expect(onSuccess).toHaveBeenCalled();
  });

  test('invalid link disables submit and shows message', async () => {
    (candidateService.updateProfile as jest.Mock).mockResolvedValue({ profile: { name: 'X' } });
    const profile = { ...baseProfile, profileLinks: [ { name: 'LinkedIn', url: 'notaurl' } ] };
    render(<CandidateProfileForm profile={profile} onSuccess={() => {}} onCancel={() => {}} />);
    const warning = screen.getByText(/Podaj poprawny adres URL/);
    expect(warning).toBeInTheDocument();
    const submit = screen.getByText('Zapisz profil');
    expect(submit).toBeDisabled();
  });

  test('fixing link enables submit', async () => {
    (candidateService.updateProfile as jest.Mock).mockResolvedValue({ profile: { name: 'X' } });
    const profile = { ...baseProfile, profileLinks: [ { name: 'LinkedIn', url: 'notaurl' } ] };
    render(<CandidateProfileForm profile={profile} onSuccess={() => {}} onCancel={() => {}} />);
    const urlInput = screen.getByPlaceholderText('https://...');
    fireEvent.change(urlInput, { target: { value: 'https://ok.com' } });
    await waitFor(() => expect(screen.queryByText(/Podaj poprawny adres URL/)).toBeNull());
    expect(screen.getByText('Zapisz profil')).not.toBeDisabled();
  });
});
