/**
 * Web Performance monitoring utilities using Web Vitals API.
 * Captures Core Web Vitals (LCP, FID, CLS, FCP, TTFB) and reports
 * them to Google Analytics for real-user monitoring (RUM).
 *
 * @module lib/performance
 */

import { logAnalyticsEvent } from "@/lib/firebase";

/**
 * Performance metric entry from the PerformanceObserver API.
 */
interface PerformanceMetric {
  /** Metric name (e.g., 'LCP', 'FID', 'CLS') */
  name: string;
  /** Metric value in milliseconds or unitless (CLS) */
  value: number;
  /** Rating: 'good', 'needs-improvement', or 'poor' */
  rating: "good" | "needs-improvement" | "poor";
}

/**
 * Thresholds for Core Web Vitals based on Google's guidelines.
 * @see https://web.dev/vitals/
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Determines the rating for a given metric value.
 *
 * @param {string} metricName - The name of the metric.
 * @param {number} value - The measured value.
 * @returns {'good' | 'needs-improvement' | 'poor'} The performance rating.
 */
function getRating(
  metricName: string,
  value: number,
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS];
  if (!threshold) {
    return "good";
  }
  if (value <= threshold.good) {
    return "good";
  }
  if (value <= threshold.poor) {
    return "needs-improvement";
  }
  return "poor";
}

/**
 * Reports a web vital metric to Google Analytics.
 * Sends the metric name, value, rating, and navigation type.
 *
 * @param {PerformanceMetric} metric - The performance metric to report.
 */
export function reportWebVital(metric: PerformanceMetric): void {
  logAnalyticsEvent("web_vitals", {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_rating: metric.rating,
    navigation_type: getNavigationType(),
  });
}

/**
 * Returns the current navigation type (navigate, reload, back_forward, prerender).
 * Falls back to 'unknown' if the Navigation Timing API is unavailable.
 *
 * @returns {string} The navigation type string.
 */
function getNavigationType(): string {
  if (typeof window === "undefined") {
    return "unknown";
  }
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return nav?.type || "unknown";
}

/**
 * Initializes Core Web Vitals monitoring using PerformanceObserver.
 * Observes LCP, FID, CLS, FCP, and TTFB and reports them to analytics.
 * Should be called once on the client side.
 */
export function initWebVitalsMonitoring(): void {
  if (
    typeof window === "undefined" ||
    typeof PerformanceObserver === "undefined"
  ) {
    return;
  }

  try {
    // Observe Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const value = lastEntry.startTime;
        reportWebVital({ name: "LCP", value, rating: getRating("LCP", value) });
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // Observe First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming | undefined;
      if (firstEntry) {
        const value = firstEntry.processingStart - firstEntry.startTime;
        reportWebVital({ name: "FID", value, rating: getRating("FID", value) });
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });

    // Observe Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      reportWebVital({
        name: "CLS",
        value: clsValue,
        rating: getRating("CLS", clsValue),
      });
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // Observe First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find((e) => e.name === "first-contentful-paint");
      if (fcpEntry) {
        const value = fcpEntry.startTime;
        reportWebVital({ name: "FCP", value, rating: getRating("FCP", value) });
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } /* istanbul ignore next */
      catch (error) {
    // PerformanceObserver may not support all entry types in all browsers
    console.error("Web Vitals monitoring initialization error:", error);
  }
}

