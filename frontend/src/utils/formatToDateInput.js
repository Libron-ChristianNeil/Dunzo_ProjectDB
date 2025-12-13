// formatToDateInput.js
export function formatToDateInput(dateStr) {
    if (!dateStr) return ""; // handle null, undefined, empty string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ""; // invalid date check
    return date.toISOString().split("T")[0];
}