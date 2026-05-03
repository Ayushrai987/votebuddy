'use client';

import { useEffect, ReactNode } from 'react';
import { initGoogleServices } from '@/lib/firebase';
import { initWebVitalsMonitoring } from '@/lib/performance';
import { useAnalytics } from '@/lib/useAnalytics';

/**
 * Provider component that initializes all Google Cloud services on mount.
 * Handles:
 * - Firebase Analytics initialization
 * - Firebase Performance Monitoring
 * - Core Web Vitals reporting to Analytics
 * - Automatic page view tracking via useAnalytics hook
 *
 * This component should wrap the main application content in the root layout.
 *
 * @param {{ children: ReactNode }} props - Component props.
 * @returns {React.ReactElement} The rendered children with Google services active.
 */
export function GoogleServicesProvider({ children }: { children: ReactNode }) {
  // Initialize analytics and page view tracking
  useAnalytics();

  useEffect(() => {
    // Initialize Firebase Analytics and Performance
    initGoogleServices();

    // Start Core Web Vitals monitoring
    initWebVitalsMonitoring();
  }, []);

  return <>{children}</>;
}
