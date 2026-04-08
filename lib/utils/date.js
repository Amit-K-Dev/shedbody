export function formatPostDate(dateInput, options = {}) {
  const {
    showUpdatedLabel = false,
    showUpdatedLable = false,
    isUpdated = false,
  } = options;

  if (!dateInput) return "-";

  const dateObj = new Date(dateInput);
  if (isNaN(dateObj)) return "-";

  const formatted = dateObj.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const shouldShowLabel = (showUpdatedLabel || showUpdatedLable) && isUpdated;

  return shouldShowLabel ? `${formatted} (Updated)` : formatted;
}
