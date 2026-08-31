import { describe, expect, it } from "vitest";

import { utcCalendarDate, utcHour, utcMonthIndex, utcWeekday } from "./utc";

describe("UTC time policy", () => {
  it("keeps calendar dates deterministic from ISO timestamps", () => {
    expect(utcCalendarDate("2026-06-15T23:30:00.000Z")).toBe("2026-06-15");
    expect(utcHour("2026-06-15T23:30:00.000Z")).toBe(23);
    expect(utcWeekday("2026-06-15T23:30:00.000Z")).toBe(1);
  });

  it("does not shift a UTC calendar date into the previous local day", () => {
    expect(utcMonthIndex("2026-01-01")).toBe(0);
    expect(utcCalendarDate("2026-01-01T00:00:00.000Z")).toBe("2026-01-01");
  });
});
