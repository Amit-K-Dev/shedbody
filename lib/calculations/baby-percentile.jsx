const percentileKeys = [2, 15, 50, 85, 98];

const growthReferences = {
  boy: {
    weight: [
      [0, 2.5, 2.9, 3.3, 3.9, 4.4],
      [3, 5.1, 5.7, 6.4, 7.2, 7.9],
      [6, 6.4, 7.1, 7.9, 8.8, 9.7],
      [9, 7.1, 7.9, 8.9, 9.9, 10.9],
      [12, 7.8, 8.6, 9.6, 10.8, 11.8],
      [15, 8.4, 9.2, 10.3, 11.5, 12.7],
      [18, 8.9, 9.8, 10.9, 12.2, 13.4],
      [21, 9.4, 10.3, 11.5, 12.9, 14.2],
      [24, 9.8, 10.8, 12.2, 13.6, 15.0],
    ],
    length: [
      [0, 46.1, 47.9, 49.9, 52.0, 53.7],
      [3, 57.3, 59.0, 61.4, 63.8, 65.5],
      [6, 63.3, 65.0, 67.6, 70.1, 71.9],
      [9, 67.7, 69.7, 72.0, 74.8, 76.6],
      [12, 71.0, 73.2, 75.7, 78.6, 80.5],
      [15, 74.1, 76.3, 79.1, 82.1, 84.2],
      [18, 76.9, 79.2, 82.3, 85.3, 87.5],
      [21, 79.4, 81.9, 85.1, 88.3, 90.5],
      [24, 81.7, 84.4, 87.8, 91.0, 93.3],
    ],
    head: [
      [0, 32.1, 33.0, 34.5, 36.0, 37.0],
      [3, 38.2, 39.2, 40.5, 42.0, 43.0],
      [6, 41.0, 42.0, 43.3, 44.8, 45.8],
      [9, 42.7, 43.7, 45.0, 46.5, 47.5],
      [12, 44.0, 45.0, 46.1, 47.6, 48.6],
      [15, 45.0, 45.9, 47.0, 48.5, 49.5],
      [18, 45.7, 46.6, 47.7, 49.2, 50.2],
      [21, 46.3, 47.2, 48.3, 49.8, 50.8],
      [24, 46.8, 47.7, 48.8, 50.3, 51.3],
    ],
  },
  girl: {
    weight: [
      [0, 2.4, 2.8, 3.2, 3.7, 4.2],
      [3, 4.6, 5.2, 5.8, 6.6, 7.4],
      [6, 5.8, 6.5, 7.3, 8.2, 9.2],
      [9, 6.6, 7.3, 8.2, 9.3, 10.4],
      [12, 7.1, 7.9, 8.9, 10.1, 11.3],
      [15, 7.7, 8.5, 9.6, 10.9, 12.2],
      [18, 8.2, 9.1, 10.2, 11.6, 13.0],
      [21, 8.7, 9.6, 10.9, 12.3, 13.8],
      [24, 9.2, 10.1, 11.5, 13.0, 14.6],
    ],
    length: [
      [0, 45.4, 47.2, 49.1, 51.2, 52.9],
      [3, 55.8, 57.6, 59.8, 62.2, 64.0],
      [6, 61.7, 63.5, 65.7, 68.3, 70.2],
      [9, 66.0, 67.9, 70.1, 72.9, 74.8],
      [12, 69.2, 71.4, 74.0, 76.9, 79.0],
      [15, 72.0, 74.3, 77.0, 80.2, 82.3],
      [18, 74.7, 77.0, 80.0, 83.3, 85.5],
      [21, 77.1, 79.6, 82.7, 86.0, 88.4],
      [24, 79.4, 82.0, 85.1, 88.6, 91.0],
    ],
    head: [
      [0, 31.7, 32.6, 33.9, 35.4, 36.4],
      [3, 37.1, 38.1, 39.5, 41.0, 42.0],
      [6, 39.7, 40.8, 42.2, 43.7, 44.8],
      [9, 41.5, 42.5, 43.8, 45.3, 46.4],
      [12, 42.7, 43.7, 45.0, 46.5, 47.6],
      [15, 43.6, 44.6, 45.9, 47.4, 48.5],
      [18, 44.3, 45.3, 46.6, 48.1, 49.2],
      [21, 44.9, 45.9, 47.2, 48.7, 49.8],
      [24, 45.4, 46.4, 47.7, 49.2, 50.3],
    ],
  },
};

const measurementMeta = {
  weight: { label: "Weight-for-age", metricUnit: "kg", imperialUnit: "lb" },
  length: { label: "Length-for-age", metricUnit: "cm", imperialUnit: "in" },
  head: { label: "Head circumference-for-age", metricUnit: "cm", imperialUnit: "in" },
};

function interpolateRows(rows, ageMonths) {
  const age = Math.max(0, Math.min(24, Number(ageMonths)));
  const upperIndex = rows.findIndex((row) => row[0] >= age);

  if (upperIndex <= 0) return rows[0];
  if (upperIndex === -1) return rows[rows.length - 1];

  const lower = rows[upperIndex - 1];
  const upper = rows[upperIndex];
  const span = upper[0] - lower[0];
  const ratio = span ? (age - lower[0]) / span : 0;

  return lower.map((value, index) =>
    index === 0 ? age : value + (upper[index] - value) * ratio,
  );
}

function estimatePercentile(value, row) {
  const values = row.slice(1);

  if (value <= values[0]) return Math.max(1, Math.round((value / values[0]) * 2));
  if (value >= values[values.length - 1]) {
    return Math.min(
      99,
      Math.round(98 + ((value - values[values.length - 1]) / values[values.length - 1]) * 6),
    );
  }

  for (let index = 0; index < values.length - 1; index += 1) {
    if (value >= values[index] && value <= values[index + 1]) {
      const ratio = (value - values[index]) / (values[index + 1] - values[index]);
      return Math.round(
        percentileKeys[index] + ratio * (percentileKeys[index + 1] - percentileKeys[index]),
      );
    }
  }

  return 50;
}

function getPercentileBand(percentile) {
  if (percentile < 2) return "Below reference range";
  if (percentile < 15) return "Lower percentile range";
  if (percentile <= 85) return "Typical percentile range";
  if (percentile <= 98) return "Higher percentile range";
  return "Above reference range";
}

function getGuidance(percentile) {
  if (percentile < 2 || percentile > 98) {
    return "This is outside the common WHO chart reference range. Discuss the result and growth trend with a pediatric clinician.";
  }

  if (percentile < 15 || percentile > 85) {
    return "This can be normal for some babies, but pattern over time matters more than one measurement.";
  }

  return "This sits within the broad middle range. Continue tracking growth over time with accurate measurements.";
}

export function calculateBabyPercentile(inputs) {
  const {
    unit = "metric",
    sex = "boy",
    ageMonths = 0,
    measurementType = "weight",
    measurementValue = 0,
  } = inputs;

  const numericAge = Number(ageMonths);
  const numericValue = Number(measurementValue);

  if (numericAge < 0 || numericAge > 24) {
    throw new Error("Age must be between 0 and 24 months");
  }

  if (!numericValue || numericValue <= 0) {
    throw new Error("Please enter a valid measurement value");
  }

  const meta = measurementMeta[measurementType] || measurementMeta.weight;
  const valueMetric =
    unit === "imperial"
      ? measurementType === "weight"
        ? numericValue * 0.453592
        : numericValue * 2.54
      : numericValue;
  const rows = growthReferences[sex]?.[measurementType] || growthReferences.boy.weight;
  const referenceRow = interpolateRows(rows, numericAge);
  const percentile = estimatePercentile(valueMetric, referenceRow);
  const p50 = referenceRow[3];

  return {
    percentile,
    category: getPercentileBand(percentile),
    measurementLabel: meta.label,
    measurementType,
    sex,
    sexLabel: sex === "girl" ? "Girl" : "Boy",
    ageMonths: Number(numericAge.toFixed(1)),
    inputValue: numericValue,
    inputUnit: unit === "imperial" ? meta.imperialUnit : meta.metricUnit,
    metricValue: Number(valueMetric.toFixed(2)),
    metricUnit: meta.metricUnit,
    medianValue: Number(p50.toFixed(2)),
    referenceRange: {
      p2: Number(referenceRow[1].toFixed(2)),
      p15: Number(referenceRow[2].toFixed(2)),
      p50: Number(referenceRow[3].toFixed(2)),
      p85: Number(referenceRow[4].toFixed(2)),
      p98: Number(referenceRow[5].toFixed(2)),
    },
    guidance: getGuidance(percentile),
    note:
      "This is a screening estimate based on simplified WHO-style reference bands for babies 0-24 months. A pediatric clinician should interpret growth trends.",
  };
}
