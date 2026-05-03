import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoothCard } from './BoothCard';
import { LanguageProvider } from '../providers/LanguageProvider';
import { Booth } from '@/types';

const mockBooth: Booth = {
  id: 'B1',
  name: 'Test Booth',
  number: 123,
  address: '123 Test St',
  constituency: 'Test Const',
  district: 'Test Dist',
  state: 'Test State',
  latitude: 0,
  longitude: 0,
  accessibility: {
    ramp: true,
    wheelchair: true,
    drinkingWater: true,
    shade: false,
    toilets: true
  }
};

const renderBoothCard = (props: Partial<React.ComponentProps<typeof BoothCard>> = {}) => {
  return render(
    <LanguageProvider>
      <BoothCard booth={mockBooth} {...props} />
    </LanguageProvider>
  );
};

describe('BoothCard', () => {
  it('renders booth details correctly', () => {
    renderBoothCard();
    
    expect(screen.getByText('Test Booth')).toBeInTheDocument();
    expect(screen.getByTestId('booth-number')).toHaveTextContent('Booth 123');
    expect(screen.getByText(/123 Test St/i)).toBeInTheDocument();
  });

  it('renders all facility badges correctly', () => {
    renderBoothCard();
    
    const badges = screen.getByTestId('accessibility-badges');
    expect(badges).toHaveTextContent('Ramp');
    expect(badges).toHaveTextContent('Water');
    expect(badges).toHaveTextContent('Toilet');
    // Shade is false
    expect(badges).not.toHaveTextContent('Shade');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    renderBoothCard({ onClick: handleClick });
    
    fireEvent.click(screen.getByTestId('booth-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation with Enter key', () => {
    const handleClick = jest.fn();
    renderBoothCard({ onClick: handleClick });
    
    fireEvent.keyDown(screen.getByTestId('booth-card'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation with Space key', () => {
    const handleClick = jest.fn();
    renderBoothCard({ onClick: handleClick });
    
    fireEvent.keyDown(screen.getByTestId('booth-card'), { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA attributes', () => {
    renderBoothCard({ isSelected: true });
    
    const card = screen.getByTestId('booth-card');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('shows correct styles when selected', () => {
    renderBoothCard({ isSelected: true });
    
    const card = screen.getByTestId('booth-card');
    expect(card.className).toContain('border-saffron-500');
  });

  it('has accessibility badges list with proper role', () => {
    renderBoothCard();
    
    const badgeList = screen.getByTestId('accessibility-badges');
    expect(badgeList).toHaveAttribute('role', 'list');
  });

  it('renders booth with no accessibility features', () => {
    const minimalBooth: Booth = {
      ...mockBooth,
      accessibility: {
        ramp: false,
        wheelchair: false,
        drinkingWater: false,
        shade: false,
        toilets: false,
      },
    };
    
    render(
      <LanguageProvider>
        <BoothCard booth={minimalBooth} />
      </LanguageProvider>
    );
    
    const badges = screen.getByTestId('accessibility-badges');
    expect(badges.children.length).toBe(0);
  });
});
