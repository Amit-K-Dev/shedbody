export function formatePostDate(dateInput, options = {}) {
  const { showUpdatedLabel = false, isUpdated = false } = options;

  if (!dateInput) return "-";

  const dateObj = new Date(dateInput);
  if (isNaN(dateObj)) return "-";

  const formatted = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return showUpdatedLabel && isUpdated ? `${formatted} (Updated)` : formatted;
}
