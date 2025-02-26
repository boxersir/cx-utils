import { DateUtils } from "../src/common/date";
import { describe, expect, it } from "vitest";

describe("Date Utilities", () => {
  it("should format date correctly", () => {
    const date = new Date(2023, 9, 8, 14, 30);
    expect(DateUtils.format(date)).toBe("2023-10-08 14:30");
    expect(DateUtils.format(date, { showTime: false })).toBe("2023-10-08");
  });

  it("should handle timezone conversion", () => {
    const nyTime = DateUtils.convertTimezone(
      "2023-10-08T12:00:00",
      "America/New_York",
      "Asia/Shanghai"
    );
    expect(nyTime).toMatch(/2023-10-08T\d{2}:00:00\+08:00/);
  });

  it("should generate date range", () => {
    const generator = DateUtils.dateRange("2023-10-01", "2023-10-03");
    const array = Array.from(generator);
    expect(array).toEqual(["2023-10-01", "2023-10-02", "2023-10-03"]);
  });

  it("should validate dates", () => {
    expect(DateUtils.isValid("2023-13-01")).toBe(false);
    expect(DateUtils.isValid("2023-12-01")).toBe(true);
  });
});
