import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { getPerformance, FirebasePerformance } from 'firebase/performance';
import { getStorage, FirebaseStorage } from 'firebase/storage';

/**
 * Firebase configuration using environment variables.
 * All sensitive values are injected at build time via NEXT_PUBLIC_ prefixed env vars.
 * @see https://firebase.google.com/docs/web/setup
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'mock-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'mock-app-id',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'mock-measurement-id',
};

/**
 * Singleton Firebase app instance.
 * Prevents re-initialization during Next.js hot reloads.
 */
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication instance */
export const auth: Auth = getAuth(app);

/** Cloud Firestore database instance */
export const db: Firestore = getFirestore(app);

/** Firebase Cloud Storage instance */
export const storage: FirebaseStorage = getStorage(app);

/** Cached references for client-side services */
let analyticsInstance: Analytics | null = null;
let performanceInstance: FirebasePerformance | null = null;

/**
 * Initializes client-side Google services (Analytics + Performance Monitoring).
 * Must only be called in browser context (not during SSR).
 * Checks for Analytics support before initialization.
 *
 * @returns {Promise<void>}
 */
export const initGoogleServices = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      const analyticsSupported = await isSupported();
      if (analyticsSupported && !analyticsInstance) {
        analyticsInstance = getAnalytics(app);
      }
      if (!performanceInstance) {
        performanceInstance = getPerformance(app);
      }
    } catch (error) {
      console.error('Error initializing Google services:', error);
    }
  }
};

/**
 * Logs a custom analytics event to Google Analytics via Firebase.
 * Silently fails if analytics is not initialized or unsupported.
 *
 * @param {string} eventName - The name of the event to log.
 * @param {Record<string, unknown>} [params] - Optional event parameters.
 */
export const logAnalyticsEvent = (eventName: string, params?: Record<string, unknown>): void => {
  if (analyticsInstance) {
    firebaseLogEvent(analyticsInstance, eventName, params);
  }
};

/**
 * Returns the cached Analytics instance, if available.
 * @returns {Analytics | null} The Analytics instance or null.
 */
export const getAnalyticsInstance = (): Analytics | null => analyticsInstance;

/**
 * Returns the cached Performance instance, if available.
 * @returns {FirebasePerformance | null} The Performance instance or null.
 */
export const getPerformanceInstance = (): FirebasePerformance | null => performanceInstance;

export default app;
