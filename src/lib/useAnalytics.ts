'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { initGoogleServices, logAnalyticsEvent } from '@/lib/firebase';

/**
 * Custom hook for Google Analytics page view tracking and event logging.
 * Automatically tracks page views on route changes and provides
 * a memoized event logging function for custom interactions.
 *
 * @example
 * ```tsx
 * const { trackEvent } = useAnalytics();
 * trackEvent('button_click', { button_name: 'find_booth' });
 * ```
 *
 * @returns {{ trackEvent: (name: string, params?: Record<string, unknown>) => void }}
 */
export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initGoogleServices();
  }, []);

  // Track page views on route change
  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_path: pathname,
      page_title: document.title,
      timestamp: new Date().toISOString(),
    });
  }, [pathname]);

  /**
   * Logs a custom analytics event.
   * @param {string} eventName - The event name (e.g., 'search_booth', 'toggle_language').
   * @param {Record<string, unknown>} [params] - Additional event parameters.
   */
  const trackEvent = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      logAnalyticsEvent(eventName, {
        ...params,
        page_path: pathname,
      });
    },
    [pathname]
  );

  return { trackEvent };
}
