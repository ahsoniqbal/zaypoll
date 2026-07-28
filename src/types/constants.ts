export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 15;
export const MAX_PAGE_LIMIT = 50;

export const POLL_TITLE_MAX_LENGTH = 140;
export const POLL_DESCRIPTION_MAX_LENGTH = 500;
export const POLL_OPTION_MAX_LENGTH = 80;
export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 6;
export const POLL_MIN_TOPICS = 1;
export const POLL_MAX_TOPICS = 5;

export const POLL_DURATION_VALUES = ["1h", "6h", "1d", "3d", "7d", "30d", "never"] as const;
export type PollDuration = (typeof POLL_DURATION_VALUES)[number];

export const POLL_DURATION_OPTIONS: ReadonlyArray<{ value: PollDuration; label: string }> = [
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "never", label: "Never" },
];

export const POLL_DURATION_HOURS: Record<PollDuration, number | null> = {
  "1h": 1,
  "6h": 6,
  "1d": 24,
  "3d": 72,
  "7d": 168,
  "30d": 720,
  never: null,
};
