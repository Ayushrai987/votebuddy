import { reportWebVital, initWebVitalsMonitoring } from "./performance";
import { logAnalyticsEvent } from "./firebase";

jest.mock("./firebase", () => ({
  logAnalyticsEvent: jest.fn(),
}));

describe("Performance Monitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof performance !== "undefined") {
      performance.getEntriesByType = jest
        .fn()
        .mockReturnValue([{ type: "navigate" }]);
    }
  });

  describe("reportWebVital", () => {
    it("reports a good metric to analytics", () => {
      reportWebVital({ name: "LCP", value: 1000, rating: "good" });
      expect(logAnalyticsEvent).toHaveBeenCalledWith(
        "web_vitals",
        expect.objectContaining({
          metric_name: "LCP",
          metric_value: 1000,
          metric_rating: "good",
          navigation_type: expect.any(String),
        }),
      );
    });

    it("reports a needs-improvement metric to analytics", () => {
      reportWebVital({ name: "FID", value: 200, rating: "needs-improvement" });
      expect(logAnalyticsEvent).toHaveBeenCalledWith(
        "web_vitals",
        expect.objectContaining({
          metric_name: "FID",
          metric_value: 200,
          metric_rating: "needs-improvement",
        }),
      );
    });
  });

  describe("initWebVitalsMonitoring", () => {
    let originalPerformanceObserver: any;

    beforeAll(() => {
      originalPerformanceObserver = (global as any).PerformanceObserver;
    });

    afterAll(() => {
      (global as any).PerformanceObserver = originalPerformanceObserver;
    });

    it("handles undefined PerformanceObserver gracefully", () => {
      (global as any).PerformanceObserver = undefined;
      expect(() => initWebVitalsMonitoring()).not.toThrow();
    });

    it("initializes observers when PerformanceObserver is available", () => {
      const mockObserve = jest.fn();
      (global as any).PerformanceObserver = class {
        observe = mockObserve;
      };

      initWebVitalsMonitoring();

      // Should observe 4 types: LCP, FID, CLS, paint (for FCP)
      expect(mockObserve).toHaveBeenCalledTimes(4);
      expect(mockObserve).toHaveBeenCalledWith({
        type: "largest-contentful-paint",
        buffered: true,
      });
      expect(mockObserve).toHaveBeenCalledWith({
        type: "first-input",
        buffered: true,
      });
      expect(mockObserve).toHaveBeenCalledWith({
        type: "layout-shift",
        buffered: true,
      });
      expect(mockObserve).toHaveBeenCalledWith({
        type: "paint",
        buffered: true,
      });
    });
  });
});
