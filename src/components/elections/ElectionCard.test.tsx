import React from 'react';
import { render, screen } from '@testing-library/react';
import { ElectionCard } from './ElectionCard';
import { LanguageProvider } from '../providers/LanguageProvider';
import { Election } from '@/types';

const mockElection: Election = {
  id: 'test-1',
  name: 'Uttar Pradesh Assembly',
  year: 2026,
  type: 'Vidhan Sabha',
  totalSeats: 403,
  status: 'upcoming',
  electionDate: '2026-05-15',
  isAnnounced: false,
  phases: []
};

const renderCard = (election: Election = mockElection) => {
  return render(
    <LanguageProvider>
      <ElectionCard election={election} />
    </LanguageProvider>
  );
};

describe('ElectionCard', () => {
  it('renders correct election details', () => {
    renderCard();
    
    expect(screen.getByTestId('election-name')).toHaveTextContent('Uttar Pradesh');
    expect(screen.getByText(/403 Seats - 2026/i)).toBeInTheDocument();
  });

  it('shows correct status badge based on date', () => {
    renderCard();
    
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Upcoming');
  });

  it('shows Live badge if election is within 7 days', () => {
    const liveElection = { ...mockElection, electionDate: '2026-05-05' };
    renderCard(liveElection);
    
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Live');
  });

  it('shows Concluded badge if election is in past', () => {
    const pastElection = { ...mockElection, electionDate: '2024-05-05' };
    renderCard(pastElection);
    
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Concluded');
  });

  it('shows "Schedule Not Announced" when isAnnounced is false', () => {
    renderCard();
    
    expect(screen.getByText(/Schedule Not Announced/i)).toBeInTheDocument();
  });

  it('hides "Schedule Not Announced" when isAnnounced is true', () => {
    const announcedElection = { ...mockElection, isAnnounced: true };
    renderCard(announcedElection);
    
    expect(screen.queryByText(/Schedule Not Announced/i)).not.toBeInTheDocument();
  });

  it('has semantic article element', () => {
    renderCard();
    
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('status badge has role="status" for screen readers', () => {
    renderCard();
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('truncates name at Assembly keyword', () => {
    const longNameElection = { ...mockElection, name: 'Maharashtra Assembly Elections' };
    renderCard(longNameElection);
    
    expect(screen.getByTestId('election-name')).toHaveTextContent('Maharashtra');
    expect(screen.getByTestId('election-name')).not.toHaveTextContent('Assembly');
  });

  it('handles election without date gracefully', () => {
    const noDateElection = { ...mockElection, electionDate: undefined };
    renderCard(noDateElection);
    
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Upcoming');
  });
});
