import {
  getElectionStatus,
  formatVoteCount,
  isValidEPIC,
  getNextElectionDate,
  getNextElection,
  sanitizeInput,
  debounce,
} from "./utils";

describe("Utility Functions", () => {
  describe("getElectionStatus", () => {
    it("should return Concluded for past dates", () => {
      const status = getElectionStatus("2024-06-04");
      expect(status.label).toBe("Concluded");
      expect(status.status).toBe("completed");
      expect(status.color).toBe("gray");
    });

    it("should return Live for today or very soon", () => {
      const today = new Date().toISOString().split("T")[0];
      const status = getElectionStatus(today);
      expect(status.label).toBe("Live");
      expect(status.pulse).toBe(true);
      expect(status.status).toBe("live");
    });

    it("should return Live for a date within 7 days", () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const status = getElectionStatus(future.toISOString().split("T")[0]);
      expect(status.label).toBe("Live");
      expect(status.pulse).toBe(true);
    });

    it("should return Upcoming for future dates beyond 7 days", () => {
      const futureDate = "2028-12-15";
      const status = getElectionStatus(futureDate);
      expect(status.label).toBe("Upcoming");
      expect(status.status).toBe("upcoming");
    });

    it("should return Upcoming if no date provided", () => {
      const status = getElectionStatus(undefined);
      expect(status.label).toBe("Upcoming");
      expect(status.status).toBe("upcoming");
    });

    it("should handle invalid date string gracefully", () => {
      const status = getElectionStatus("not-a-date");
      expect(status.label).toBe("Upcoming");
      expect(status.status).toBe("upcoming");
    });

    it("should handle empty string date", () => {
      const status = getElectionStatus("");
      expect(status.label).toBe("Upcoming");
    });
  });

  describe("formatVoteCount", () => {
    it("should format Crores correctly", () => {
      expect(formatVoteCount(970000000)).toBe("97 Cr+");
      expect(formatVoteCount(152000000)).toBe("15.2 Cr+");
    });

    it("should format exactly 1 Crore", () => {
      expect(formatVoteCount(10000000)).toBe("1 Cr+");
    });

    it("should format Lakhs correctly", () => {
      expect(formatVoteCount(1050000)).toBe("10.5 L+");
      expect(formatVoteCount(100000)).toBe("1 L+");
    });

    it("should format Thousands correctly", () => {
      expect(formatVoteCount(50000)).toBe("50 K+");
      expect(formatVoteCount(1200)).toBe("1.2 K+");
    });

    it("should format exactly 1000", () => {
      expect(formatVoteCount(1000)).toBe("1 K+");
    });

    it("should return string for small numbers", () => {
      expect(formatVoteCount(543)).toBe("543");
      expect(formatVoteCount(0)).toBe("0");
      expect(formatVoteCount(999)).toBe("999");
    });

    it("should throw error for negative numbers", () => {
      expect(() => formatVoteCount(-1)).toThrow(
        "Vote count cannot be negative",
      );
    });
  });

  describe("isValidEPIC", () => {
    it("should validate correct EPIC format", () => {
      expect(isValidEPIC("ABC1234567")).toBe(true);
      expect(isValidEPIC("xyz9876543")).toBe(true); // Case insensitive check handled
    });

    it("should reject incorrect formats", () => {
      expect(isValidEPIC("AB1234567")).toBe(false); // Too few letters
      expect(isValidEPIC("ABCD1234567")).toBe(false); // Too many letters
      expect(isValidEPIC("ABC123456")).toBe(false); // Too few digits
      expect(isValidEPIC("ABC12345678")).toBe(false); // Too many digits
      expect(isValidEPIC("1234567ABC")).toBe(false); // Wrong order
    });

    it("should reject empty string", () => {
      expect(isValidEPIC("")).toBe(false);
    });

    it("should handle null/undefined gracefully", () => {
      expect(isValidEPIC(null as any)).toBe(false);
      expect(isValidEPIC(undefined as any)).toBe(false);
    });

    it("should reject strings with special characters", () => {
      expect(isValidEPIC("AB@1234567")).toBe(false);
      expect(isValidEPIC("ABC 1234567")).toBe(false);
    });
  });

  describe("getNextElectionDate", () => {
    it("should return a date string for the next election", () => {
      const date = getNextElectionDate();
      expect(typeof date).toBe("string");
      if (date) {
        expect(new Date(date).getTime()).toBeGreaterThan(new Date().getTime());
      }
    });
  });

  describe("getNextElection", () => {
    it("should return an election object with required fields", () => {
      const next = getNextElection();
      if (next) {
        expect(next.id).toBeDefined();
        expect(next.name).toBeDefined();
        expect(next.year).toBeDefined();
        expect(typeof next.totalSeats).toBe("number");
      }
    });
  });

  describe("sanitizeInput", () => {
    it("should remove script tags", () => {
      const result = sanitizeInput('<script>alert("xss")</script>Hello');
      expect(result).toBe("Hello");
      expect(result).not.toContain("script");
    });

    it("should remove HTML angle brackets", () => {
      const result = sanitizeInput("Hello <b>world</b>");
      expect(result).toBe("Hello bworld/b");
    });

    it("should handle empty string", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("should handle null/undefined gracefully", () => {
      expect(sanitizeInput(null as any)).toBe("");
      expect(sanitizeInput(undefined as any)).toBe("");
    });

    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should handle nested script tags", () => {
      const result = sanitizeInput('<script>alert("xss")</script>safe content');
      expect(result).not.toContain("<script>");
      expect(result).toContain("safe content");
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should delay function execution", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 300);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on subsequent calls", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 300);

      debounced();
      jest.advanceTimersByTime(200);
      debounced(); // Reset
      jest.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to the debounced function", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("arg1", "arg2");
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });
});
