import { z } from "zod";

/**
 * ISO-8601 timestamp as returned by GitHub GraphQL DateTime fields.
 * Uses Date.parse rather than z.string().datetime() so fractional seconds
 * and `Z` vs offset forms both pass without leaking the raw value in errors.
 */
export const isoTimestampSchema = z.string().refine(
  (value) => Number.isFinite(Date.parse(value)),
  "Expected an ISO-8601 timestamp",
);

/** GitHub contribution calendar day. */
export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

export const nonNegativeIntSchema = z.number().int().nonnegative();
