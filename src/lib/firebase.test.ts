import {
  initGoogleServices,
  logAnalyticsEvent,
  getAnalyticsInstance,
  getPerformanceInstance,
} from "./firebase";
import { isSupported, getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn().mockReturnValue([]),
  getApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
}));

jest.mock("firebase/analytics", () => ({
  isSupported: jest.fn().mockResolvedValue(true),
  getAnalytics: jest.fn().mockReturnValue({}),
  logEvent: jest.fn(),
}));

jest.mock("firebase/performance", () => ({
  getPerformance: jest.fn().mockReturnValue({}),
}));

describe("Firebase Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initGoogleServices", () => {
    it("initializes analytics and performance if supported", async () => {
      await initGoogleServices();
      expect(isSupported).toHaveBeenCalled();
      expect(getAnalytics).toHaveBeenCalled();
      expect(getPerformance).toHaveBeenCalled();
    });

    it("handles analytics not supported gracefully", async () => {
      (isSupported as jest.Mock).mockResolvedValueOnce(false);
      await initGoogleServices();
      expect(getAnalytics).not.toHaveBeenCalled();
    });

    it("handles initialization errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (isSupported as jest.Mock).mockRejectedValueOnce(new Error("Test error"));
      await initGoogleServices();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error initializing Google services:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("logAnalyticsEvent", () => {
    it("logs events correctly when initialized", async () => {
      await initGoogleServices(); // Ensure analyticsInstance is set
      logAnalyticsEvent("test_event", { param: "value" });
      expect(logEvent).toHaveBeenCalledWith(expect.anything(), "test_event", {
        param: "value",
      });
    });
  });

  describe("Instance Getters", () => {
    it("returns analytics instance", async () => {
      await initGoogleServices();
      expect(getAnalyticsInstance()).toBeDefined();
    });

    it("returns performance instance", async () => {
      await initGoogleServices();
      expect(getPerformanceInstance()).toBeDefined();
    });
  });
});
