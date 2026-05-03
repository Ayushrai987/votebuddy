import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { LanguageProvider } from '../providers/LanguageProvider';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => {
    return <a href={href} {...props}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const renderHeader = () => {
  return render(
    <LanguageProvider>
      <Header />
    </LanguageProvider>
  );
};

describe('Header (Navbar)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('renders all main links', () => {
    renderHeader();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Elections/i)).toBeInTheDocument();
    expect(screen.getByText(/States/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Chat/i)).toBeInTheDocument();
  });

  it('renders skip to content link for accessibility', () => {
    renderHeader();
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('language toggle switches language correctly', () => {
    renderHeader();
    const toggle = screen.getByTestId('lang-toggle');
    
    // Initial English
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    
    // Switch to Hindi
    fireEvent.click(toggle);
    
    expect(screen.getAllByRole('link', { name: /मुख्य पृष्ठ/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /चुनाव/i })[0]).toBeInTheDocument();
  });

  it('mobile menu opens and shows links', () => {
    renderHeader();
    const menuBtn = screen.getByLabelText(/Open navigation menu/i);
    
    fireEvent.click(menuBtn);
    
    // Links should appear in mobile menu
    const mobileHomeLinks = screen.getAllByRole('link', { name: /Home/i });
    expect(mobileHomeLinks.length).toBeGreaterThan(0);
  });

  it('mobile menu has correct ARIA attributes', () => {
    renderHeader();
    const menuBtn = screen.getByLabelText(/Open navigation menu/i);
    
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(menuBtn);
    
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('mobile menu closes on Escape key', () => {
    renderHeader();
    const menuBtn = screen.getByLabelText(/Open navigation menu/i);
    
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper banner role', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('has theme toggle with descriptive label', () => {
    renderHeader();
    const themeBtn = screen.getByLabelText(/Switch to light theme/i);
    expect(themeBtn).toBeInTheDocument();
  });

  it('has language toggle with descriptive label', () => {
    renderHeader();
    const langBtn = screen.getByLabelText(/Switch language to Hindi/i);
    expect(langBtn).toBeInTheDocument();
  });

  it('renders brand name VoteBuddy', () => {
    renderHeader();
    expect(screen.getByText('VoteBuddy')).toBeInTheDocument();
  });
});
