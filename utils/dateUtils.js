/**
 * Normalizes a date to UTC midnight (00:00:00.000Z) to avoid timezone discrepancies
 */
function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Calculates number of nights between checkIn and checkOut
 */
function calculateNights(checkIn, checkOut) {
  const start = normalizeDate(checkIn);
  const end = normalizeDate(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculates hours difference between a target future date and current time (or given base date)
 */
function hoursUntil(targetDate, baseDate = new Date()) {
  const target = new Date(targetDate).getTime();
  const base = new Date(baseDate).getTime();
  return (target - base) / (1000 * 60 * 60);
}

/**
 * Date overlap logic:
 * startA < endB AND endA > startB
 */
function isDateOverlap(startA, endA, startB, endB) {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();

  return a1 < b2 && a2 > b1;
}

module.exports = {
  normalizeDate,
  calculateNights,
  hoursUntil,
  isDateOverlap
};
