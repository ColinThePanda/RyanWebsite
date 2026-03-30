export interface QuestionEntry {
  askedAt: string;
  question: string;
  answer: string;
}

export interface QuestionRecord extends QuestionEntry {
  isoAskedAt: string;
  sortTimestamp: number;
  dateLabel: string;
  timeLabel: string;
}

const QUESTION_TIMESTAMP_PATTERN = /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})$/;

export function getQuestionRecords(entries: QuestionEntry[]): QuestionRecord[] {
  return [...entries]
    .map((entry) => {
      const { isoAskedAt, sortTimestamp, dateLabel, timeLabel } = parseQuestionTimestamp(entry.askedAt);

      return {
        ...entry,
        isoAskedAt,
        sortTimestamp,
        dateLabel,
        timeLabel,
      };
    })
    .sort((left, right) => right.sortTimestamp - left.sortTimestamp);
}

function parseQuestionTimestamp(value: string) {
  const match = value.trim().match(QUESTION_TIMESTAMP_PATTERN);

  if (!match) {
    throw new Error(
      `Invalid question timestamp "${value}". Expected format "YYYY.MM.DD HH:MM".`,
    );
  }

  const [, year, month, day, hour, minute] = match;
  const sortTimestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (Number.isNaN(sortTimestamp)) {
    throw new Error(`Invalid question timestamp "${value}".`);
  }

  return {
    isoAskedAt: `${year}-${month}-${day}T${hour}:${minute}:00Z`,
    sortTimestamp,
    dateLabel: `${year}.${month}.${day}`,
    timeLabel: `${hour}:${minute}`,
  };
}
