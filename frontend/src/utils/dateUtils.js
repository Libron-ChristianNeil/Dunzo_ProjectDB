/**
 * Date utilities for Calendar using Temporal API
 * All dates use Asia/Manila timezone
 */

const TIMEZONE = 'Asia/Manila';

/**
 * Convert ISO string from backend to Temporal.ZonedDateTime
 * @param {string} isoString - ISO date string from backend
 * @returns {Temporal.ZonedDateTime}
 */
export const toZonedDateTime = (isoString) => {
    if (!isoString) return null;

    // Parse the ISO string and convert to Manila timezone
    const instant = Temporal.Instant.from(isoString.endsWith('Z') ? isoString : isoString + 'Z');
    return instant.toZonedDateTimeISO(TIMEZONE);
};

/**
 * Convert local datetime-local input value to ISO string for API
 * @param {string} localDateTimeString - Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns {string} - ISO string for backend
 */
export const toISOStringForAPI = (localDateTimeString) => {
    if (!localDateTimeString) return null;

    // Parse as PlainDateTime and convert to ZonedDateTime in Manila
    const plainDateTime = Temporal.PlainDateTime.from(localDateTimeString);
    const zonedDateTime = plainDateTime.toZonedDateTime(TIMEZONE);

    // Return ISO string
    return zonedDateTime.toInstant().toString();
};

/**
 * Format Temporal.ZonedDateTime for datetime-local input
 * @param {Temporal.ZonedDateTime|string} dateValue - Temporal object or ISO string
 * @returns {string} - Formatted as YYYY-MM-DDTHH:mm for input
 */
export const formatForDateTimeInput = (dateValue) => {
    if (!dateValue) return '';

    // If already a string, ensure it has T separator and trim seconds
    if (typeof dateValue === 'string') {
        return dateValue.replace(' ', 'T').slice(0, 16);
    }

    // If Temporal object, convert to PlainDateTime string
    try {
        return dateValue.toPlainDateTime().toString().slice(0, 16);
    } catch (e) {
        return String(dateValue).slice(0, 16);
    }
};

/**
 * Get current datetime in Manila timezone formatted for input
 * @returns {string}
 */
export const getCurrentDateTimeForInput = () => {
    const now = Temporal.Now.zonedDateTimeISO(TIMEZONE);
    return now.toPlainDateTime().toString().slice(0, 16);
};

/**
 * Get datetime 1 hour from now in Manila timezone
 * @returns {string}
 */
export const getDefaultEndDateTime = () => {
    const now = Temporal.Now.zonedDateTimeISO(TIMEZONE);
    const oneHourLater = now.add({ hours: 1 });
    return oneHourLater.toPlainDateTime().toString().slice(0, 16);
};

export { TIMEZONE };
