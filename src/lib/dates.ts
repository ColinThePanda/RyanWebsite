export function parseSortDate(value?: string, filePath?: string) {
  if (!value) {
    return 0;
  }

  const timestamp = parseDateValue(value);

  if (Number.isNaN(timestamp)) {
    const suffix = filePath ? ` in ${filePath}` : "";
    throw new Error(`Invalid date "${value}"${suffix}`);
  }

  return timestamp;
}

function parseDateValue(value: string) {
  const trimmed = value.trim();

  const yearFirst = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);

  if (yearFirst) {
    return buildUtcTimestamp(yearFirst[1], yearFirst[2], yearFirst[3]);
  }

  const monthFirst = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

  if (monthFirst) {
    return buildUtcTimestamp(monthFirst[3], monthFirst[1], monthFirst[2]);
  }

  const parsed = Date.parse(trimmed);

  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  return Number.NaN;
}

function buildUtcTimestamp(year: string, month: string, day: string) {
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (
    !Number.isInteger(yearNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(dayNumber) ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31
  ) {
    return Number.NaN;
  }

  return Date.UTC(yearNumber, monthNumber - 1, dayNumber);
}
