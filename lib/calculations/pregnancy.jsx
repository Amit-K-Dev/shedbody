const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value, label) {
  if (!value) {
    throw new Error(`Please enter ${label}`);
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Please enter a valid ${label}`);
  }

  return date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end - start) / DAY_MS);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getTrimester(gestationalDays) {
  if (gestationalDays < 0) return "Not started";
  if (gestationalDays < 98) return "First trimester";
  if (gestationalDays < 196) return "Second trimester";
  return "Third trimester";
}

function getProgressStatus(gestationalDays) {
  if (gestationalDays < 0) return "Future dating";
  if (gestationalDays < 259) return "In progress";
  if (gestationalDays <= 294) return "Full-term window";
  return "Past estimated due range";
}

export function calculatePregnancy(inputs) {
  const {
    method = "lmp",
    lmpDate,
    conceptionDate,
    cycleLength = 28,
  } = inputs;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let datingDate;
  let pregnancyStart;
  let dueDate;
  let conceptionEstimate;
  let datingBasis;

  if (method === "conception") {
    datingDate = parseDate(conceptionDate, "conception date");

    if (datingDate > today) {
      throw new Error("Conception date cannot be in the future");
    }

    conceptionEstimate = datingDate;
    pregnancyStart = addDays(datingDate, -14);
    dueDate = addDays(datingDate, 266);
    datingBasis = "Conception date";
  } else {
    datingDate = parseDate(lmpDate, "last menstrual period date");

    if (datingDate > today) {
      throw new Error("Last menstrual period date cannot be in the future");
    }

    const cycleAdjustment = Math.max(20, Math.min(45, Number(cycleLength) || 28)) - 28;
    pregnancyStart = datingDate;
    conceptionEstimate = addDays(datingDate, 14 + cycleAdjustment);
    dueDate = addDays(datingDate, 280 + cycleAdjustment);
    datingBasis = "Last menstrual period";
  }

  const gestationalDays = diffDays(pregnancyStart, today);
  const daysUntilDue = diffDays(today, dueDate);
  const weeks = Math.max(0, Math.floor(gestationalDays / 7));
  const days = Math.max(0, gestationalDays % 7);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((gestationalDays / 280) * 100)),
  );

  const milestones = [
    {
      label: "Estimated conception",
      date: conceptionEstimate,
      note: "Approximate timing based on selected method.",
    },
    {
      label: "End of first trimester",
      date: addDays(pregnancyStart, 98),
      note: "Around 14 weeks of gestational age.",
    },
    {
      label: "20-week anatomy window",
      date: addDays(pregnancyStart, 140),
      note: "Common midpoint used for pregnancy tracking.",
    },
    {
      label: "Full-term begins",
      date: addDays(pregnancyStart, 259),
      note: "Around 37 weeks.",
    },
  ].map((item) => ({
    ...item,
    dateISO: item.date.toISOString(),
    dateLabel: formatDate(item.date),
    daysFromToday: diffDays(today, item.date),
  }));

  return {
    dueDate: dueDate.toISOString(),
    dueDateLabel: formatDate(dueDate),
    conceptionDate: conceptionEstimate.toISOString(),
    conceptionDateLabel: formatDate(conceptionEstimate),
    pregnancyStart: pregnancyStart.toISOString(),
    pregnancyStartLabel: formatDate(pregnancyStart),
    gestationalDays,
    gestationalWeeks: weeks,
    gestationalRemainderDays: days,
    daysUntilDue,
    progressPercent,
    trimester: getTrimester(gestationalDays),
    status: getProgressStatus(gestationalDays),
    datingBasis,
    category: getTrimester(gestationalDays),
    milestones,
    note:
      "This is an estimate. A clinician may adjust dating after ultrasound or medical review.",
  };
}
