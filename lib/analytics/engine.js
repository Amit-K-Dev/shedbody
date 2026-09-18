/**
 * Pure JavaScript analytics module for ShedBody trend metrics.
 * Operates on bounded, pre-sorted datasets.
 * Does not perform any database queries.
 */

/**
 * Calculates standardized trend metrics from bounded historical data.
 * @param {Array} data - Array of pre-sorted data points (ascending order by entry_date).
 * @param {Function} valueSelector - Function to extract the numeric value from a data point.
 * @param {Function} dateSelector - Function to extract the date string (YYYY-MM-DD) from a data point.
 * @returns {Object} { current, previous, change, percentageChange, direction, rateOfChange, points }
 */
export function calculateTrend(data, valueSelector, dateSelector) {
  if (!Array.isArray(data)) {
    return _emptyTrend();
  }

  // Filter out invalid/null values before calculations
  const validData = data.filter(item => {
    const val = valueSelector(item);
    return val !== null && val !== undefined && !Number.isNaN(Number(val));
  });

  if (validData.length === 0) {
    return _emptyTrend();
  }

  if (validData.length === 1) {
    const currentPoint = validData[0];
    const currentValue = Number(valueSelector(currentPoint));
    return {
      current: currentValue,
      previous: null,
      change: null,
      percentageChange: null,
      direction: "flat",
      rateOfChange: null,
      points: [
        {
          date: dateSelector(currentPoint),
          value: currentValue
        }
      ]
    };
  }

  const currentPoint = validData[validData.length - 1];
  const previousPoint = validData[validData.length - 2];

  const current = Number(valueSelector(currentPoint));
  const previous = Number(valueSelector(previousPoint));

  const change = current - previous;

  let percentageChange = null;
  if (previous !== 0) {
    percentageChange = (change / previous) * 100;
  }

  let direction = "flat";
  if (change > 0) direction = "up";
  else if (change < 0) direction = "down";

  // Calculate rate of change
  const currentDateStr = dateSelector(currentPoint);
  const previousDateStr = dateSelector(previousPoint);

  // Safe date parsing to calculate duration in days
  // Appending T00:00:00Z ensures consistent UTC parsing without timezone shifting
  const d1 = new Date(previousDateStr + "T00:00:00Z").getTime();
  const d2 = new Date(currentDateStr + "T00:00:00Z").getTime();

  let rateOfChange = null;
  if (!Number.isNaN(d1) && !Number.isNaN(d2)) {
    const durationInDays = (d2 - d1) / (1000 * 60 * 60 * 24);
    if (durationInDays > 0) {
      rateOfChange = change / durationInDays;
    }
  }

  return {
    current,
    previous,
    change,
    percentageChange,
    direction,
    rateOfChange,
    points: validData.map(item => ({
      date: dateSelector(item), // Preserve YYYY-MM-DD exactly
      value: Number(valueSelector(item))
    }))
  };
}

function _emptyTrend() {
  return {
    current: null,
    previous: null,
    change: null,
    percentageChange: null,
    direction: "flat",
    rateOfChange: null,
    points: []
  };
}

export function validateDateRange(startDateStr, endDateStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
    throw new Error("Dates must be in YYYY-MM-DD format");
  }

  const isValidGregorian = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  if (!isValidGregorian(startDateStr) || !isValidGregorian(endDateStr)) {
    throw new Error("Invalid calendar date");
  }

  if (startDateStr > endDateStr) {
    throw new Error("startDate must be less than or equal to endDate");
  }

  const d1 = new Date(startDateStr + "T00:00:00Z").getTime();
  const d2 = new Date(endDateStr + "T00:00:00Z").getTime();
  const diffDays = (d2 - d1) / (1000 * 60 * 60 * 24);

  // Inclusive calendar days = difference in days + 1
  if (diffDays + 1 > 365) {
    throw new Error("Date range exceeds maximum allowed limit of 365 days");
  }
}
