export type KDateRangePickerType = "date" | "datetime-local";
export type KDateRangePickerSize = "small" | "medium" | "large";
export type KDateRangeShortcutKey =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-30-days";
export type KDateRangeGranularity = "hour" | "day" | "week" | "month";

export interface KDateRangeValue {
  readonly start: string;
  readonly end: string;
}

export interface KDateRangeShortcut {
  readonly key: KDateRangeShortcutKey;
  readonly label: string;
}

export interface KDateRangeGranularityOption {
  readonly value: KDateRangeGranularity;
  readonly label: string;
  readonly minSpanDays?: number;
  readonly maxSpanDays?: number;
}

export interface KDateRangeGranularityChange {
  readonly value: KDateRangeGranularity;
  readonly reason: "user" | "range";
}

export interface KDateRangePickerProps {
  readonly id?: string;
  readonly startName?: string;
  readonly endName?: string;
  readonly type?: KDateRangePickerType;
  readonly size?: KDateRangePickerSize;
  readonly startLabel?: string;
  readonly endLabel?: string;
  readonly min?: string;
  readonly max?: string;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly invalid?: boolean;
  readonly clearable?: boolean;
  readonly showShortcuts?: boolean;
  readonly shortcuts?: readonly KDateRangeShortcut[];
  readonly timeZone?: string;
  readonly showTimeZone?: boolean;
  readonly maxSpanDays?: number;
  readonly showGranularity?: boolean;
  readonly granularity?: KDateRangeGranularity;
  readonly granularityOptions?: readonly KDateRangeGranularityOption[];
}
