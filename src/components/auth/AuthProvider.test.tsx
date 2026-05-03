import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn().mockReturnValue({ id: 'mock-doc' }),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock Firebase lib
jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  logAnalyticsEvent: jest.fn(),
}));

const TestComponent = () => {
  const { user, loading, error, signInWithGoogle, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user?.displayName || 'No User'}</span>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="error">{error || 'No Error'}</span>
      <button onClick={signInWithGoogle} data-testid="sign-in">Sign In</button>
      <button onClick={logout} data-testid="logout">Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  const mockUser = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'http://example.com/photo.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('syncs user profile to Firestore after first login', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    (setDoc as jest.Mock).mockResolvedValue({});

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        uid: '123',
        displayName: 'Test User',
      })
    );
  });

  it('shows No User when signed out', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('does not create new Firestore doc for existing users', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(setDoc).not.toHaveBeenCalled();
  });

  it('handles Firestore sync errors gracefully', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // User should still be set despite Firestore error
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
  });

  it('handles signInWithGoogle popup being cancelled', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    (signInWithPopup as jest.Mock).mockRejectedValue({ code: 'auth/popup-closed-by-user' });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('sign-in'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Sign-in was cancelled.');
    });
  });

  it('handles signOut being called', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
    (signOut as jest.Mock).mockResolvedValue({});

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout'));
    });

    expect(signOut).toHaveBeenCalled();
  });

  it('sets loading to false after auth state resolves', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});
