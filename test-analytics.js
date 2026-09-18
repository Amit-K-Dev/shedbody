import assert from 'node:assert';
import { calculateTrend, validateDateRange } from './lib/analytics/engine.js';

// Note: We do not import getBoundedProgress because direct Node execution cannot natively
// resolve the Next.js @/ aliases or run the Supabase server client properly without a framework/mock.
// The DAL integration limitation prevents us from spinning up a full test double here,
// so we execute pure validation tests separated from the DAL module integration itself.

function runEngineTests() {
  const valSel = (item) => item.value;
  const dateSel = (item) => item.date;

  // 1. Empty dataset
  let result = calculateTrend([], valSel, dateSel);
  assert.strictEqual(result.current, null);

  // 2. One point
  result = calculateTrend([{ date: "2026-09-18", value: 75 }], valSel, dateSel);
  assert.strictEqual(result.current, 75);
  assert.strictEqual(result.previous, null);
  assert.strictEqual(result.direction, "flat");

  // 3. Three points
  result = calculateTrend([
    { date: "2026-09-10", value: 80 },
    { date: "2026-09-15", value: 76 },
    { date: "2026-09-18", value: 75 }
  ], valSel, dateSel);
  assert.strictEqual(result.current, 75);
  assert.strictEqual(result.previous, 76);
  assert.strictEqual(result.change, -1);
  assert.strictEqual(result.percentageChange, (-1/76)*100);
  assert.strictEqual(result.direction, "down");
  assert.strictEqual(result.rateOfChange, -1 / 3);

  // 4. Increasing values
  result = calculateTrend([{ date: "2026-09-15", value: 70 }, { date: "2026-09-18", value: 75 }], valSel, dateSel);
  assert.strictEqual(result.direction, "up");

  // 5. Decreasing values
  result = calculateTrend([{ date: "2026-09-15", value: 80 }, { date: "2026-09-18", value: 75 }], valSel, dateSel);
  assert.strictEqual(result.direction, "down");

  // 6. Equal values
  result = calculateTrend([{ date: "2026-09-15", value: 75 }, { date: "2026-09-18", value: 75 }], valSel, dateSel);
  assert.strictEqual(result.direction, "flat");
  assert.strictEqual(result.change, 0);

  // 7. Previous = 0
  result = calculateTrend([{ date: "2026-09-15", value: 0 }, { date: "2026-09-18", value: 5 }], valSel, dateSel);
  assert.strictEqual(result.percentageChange, null);

  // 8 & 9. Null / Invalid values
  result = calculateTrend([
    { date: "2026-09-15", value: null },
    { date: "2026-09-16", value: undefined },
    { date: "2026-09-17", value: NaN },
    { date: "2026-09-18", value: 75 }
  ], valSel, dateSel);
  assert.strictEqual(result.points.length, 1);
  assert.strictEqual(result.previous, null);

  // 10. Zero-day duration
  result = calculateTrend([{ date: "2026-09-18", value: 76 }, { date: "2026-09-18", value: 75 }], valSel, dateSel);
  assert.strictEqual(result.rateOfChange, null);

  // 11. Date-only preservation
  result = calculateTrend([{ date: "2026-09-18", value: 75 }], valSel, dateSel);
  assert.strictEqual(result.points[0].date, "2026-09-18");
}

function runDateValidatorTests() {
  // Test invalid format
  assert.throws(() => validateDateRange("09/18/2026", "2026-09-18"), /YYYY-MM-DD/);

  // Test impossible dates (rejects)
  assert.throws(() => validateDateRange("2026-02-30", "2026-03-01"), /Invalid calendar date/);
  assert.throws(() => validateDateRange("2026-04-31", "2026-05-01"), /Invalid calendar date/);
  assert.throws(() => validateDateRange("2025-02-29", "2025-03-01"), /Invalid calendar date/);

  // Test valid dates (accepts)
  assert.doesNotThrow(() => validateDateRange("2024-02-29", "2024-03-01")); // 2024 is leap year
  assert.doesNotThrow(() => validateDateRange("2026-02-28", "2026-03-01"));

  // Test reversed range
  assert.throws(() => validateDateRange("2026-09-18", "2026-09-10"), /startDate must be less than or equal to endDate/);

  // Test exactly 365-day range (accepted)
  // e.g. 2025-01-01 to 2025-12-31 is 365 days inclusive (diffDays = 364)
  assert.doesNotThrow(() => validateDateRange("2025-01-01", "2025-12-31"));

  // Test >365-day range (rejected)
  // e.g. 2025-01-01 to 2026-01-01 is 366 days inclusive (diffDays = 365)
  assert.throws(() => validateDateRange("2025-01-01", "2026-01-01"), /exceeds maximum allowed limit/);
}

runEngineTests();
runDateValidatorTests();
console.log("All tests passed successfully.");
