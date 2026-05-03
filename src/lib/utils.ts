/* eslint-disable no-unused-vars */
import { allElections } from "@/data/elections";
import { Election } from "@/types";

/**
 * @module lib/utils
 * Core utility functions for election status determination,
 * data formatting, and input validation.
 */

/** Possible election status values */
type ElectionStatusType = "completed" | "live" | "upcoming";

/** Return type for getElectionStatus */
interface ElectionStatusResult {
  /** Human-readable label */
  label: string;
  /** Color theme identifier */
  color: string;
  /** Machine-readable status code */
  status: ElectionStatusType;
  /** Whether to show a pulsing animation (active/live) */
  pulse?: boolean;
}

/**
 * Determines the status of an election based on the current date.
 * Uses day-level comparison (ignoring time) for consistency.
 *
 * - Past dates → "Concluded" (gray)
 * - Within 7 days → "Live" (orange, pulsing)
 * - Future dates → "Upcoming" (orange)
 * - Undefined date → "Upcoming" (default)
 *
 * @param {string | undefined} electionDateStr - ISO date string of the election.
 * @returns {ElectionStatusResult} Object containing status label, color theme, and animations.
 *
 * @example
 * ```ts
 * const status = getElectionStatus('2026-05-15');
 * // { label: "Upcoming", color: "orange", status: "upcoming" }
 * ```
 */
export const getElectionStatus = (electionDateStr: string | undefined): ElectionStatusResult => {
  if (!electionDateStr) {
    return { label: "Upcoming", color: "orange", status: "upcoming" };
  }

  const now = new Date();
  const electionDate = new Date(electionDateStr);

  // Validate date parsing
  if (isNaN(electionDate.getTime())) {
    return { label: "Upcoming", color: "orange", status: "upcoming" };
  }

  // Set time to 00:00:00 for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eDate = new Date(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate());

  const diffTime = eDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Concluded", color: "gray", status: "completed" };
  } else if (diffDays >= 0 && diffDays <= 7) {
    // Current or very soon
    return { label: "Live", color: "orange", status: "live", pulse: true };
  } else {
    return { label: "Upcoming", color: "orange", status: "upcoming" };
  }
};

/**
 * Retrieves the next upcoming election from the global data set.
 * Filters elections with valid future dates and returns the nearest one.
 *
 * @returns {Election | undefined} The election object or undefined if none found.
 *
 * @example
 * ```ts
 * const next = getNextElection();
 * if (next) {
 *   console.log(`Next: ${next.name} on ${next.electionDate}`);
 * }
 * ```
 */
export const getNextElection = (): Election | undefined => {
  const now = new Date();
  return allElections
    .filter(e => e.electionDate && new Date(e.electionDate) > now)
    .sort((a, b) => new Date(a.electionDate!).getTime() - new Date(b.electionDate!).getTime())[0];
};

/**
 * Convenience helper to get the formatted date of the next election.
 *
 * @returns {string} The ISO date string or empty string if no upcoming election.
 */
export const getNextElectionDate = (): string => {
  const next = getNextElection();
  return next?.electionDate || "";
};

/**
 * Formats numeric vote counts into localized, human-readable strings.
 * Supports Indian number system denominations:
 * - Crore (Cr): ≥ 1,00,00,000
 * - Lakh (L): ≥ 1,00,000
 * - Thousand (K): ≥ 1,000
 *
 * @param {number} count - The raw numeric count. Must be non-negative.
 * @returns {string} Formatted string (e.g., "1.2 Cr+").
 * @throws {Error} If count is negative.
 *
 * @example
 * ```ts
 * formatVoteCount(970000000); // "97 Cr+"
 * formatVoteCount(1050000);   // "10.5 L+"
 * formatVoteCount(50000);     // "50 K+"
 * formatVoteCount(543);       // "543"
 * ```
 */
export const formatVoteCount = (count: number): string => {
  if (count < 0) {
    throw new Error("Vote count cannot be negative");
  }
  if (count >= 10000000) {
    return (count / 10000000).toFixed(1).replace(/\.0$/, '') + " Cr+";
  }
  if (count >= 100000) {
    return (count / 100000).toFixed(1).replace(/\.0$/, '') + " L+";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + " K+";
  }
  return count.toString();
};

/**
 * Validates the format of an Indian EPIC (Voter ID) number.
 * Standard format: 3 uppercase letters followed by 7 numeric digits.
 *
 * @param {string} epic - The EPIC string to validate.
 * @returns {boolean} True if format is valid, false otherwise.
 *
 * @example
 * ```ts
 * isValidEPIC('ABC1234567'); // true
 * isValidEPIC('AB1234567');  // false (only 2 letters)
 * isValidEPIC('');           // false
 * ```
 */
export const isValidEPIC = (epic: string): boolean => {
  if (!epic || typeof epic !== 'string') {
    return false;
  }
  const regex = /^[A-Z]{3}[0-9]{7}$/;
  return regex.test(epic.toUpperCase());
};

/**
 * Sanitizes user input by removing potentially dangerous HTML/script content.
 * Used as a defense-in-depth measure alongside server-side sanitization.
 *
 * @param {string} input - The raw user input string.
 * @returns {string} The sanitized string with script tags and HTML brackets removed.
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/[<>]/g, "")
    .trim();
};

/**
 * Debounce utility function to limit the rate of function execution.
 * Useful for search inputs, scroll handlers, and resize events.
 *
 * @template T
 * @param {T} func - The function to debounce.
 * @param {number} waitMs - The debounce delay in milliseconds.
 * @returns {T} The debounced function.
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce(handleSearch, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };

  return debounced as unknown as T;
}


