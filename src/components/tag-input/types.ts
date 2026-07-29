export type KTagInputSize = "small" | "medium" | "large";
export type KTagRejectReason = "empty" | "duplicate" | "format" | "length" | "limit";

export interface KTagRejection {
  readonly value: string;
  readonly reason: KTagRejectReason;
  readonly message: string;
}

export interface KTagInputProps {
  readonly id?: string;
  readonly name?: string;
  readonly placeholder?: string;
  readonly size?: KTagInputSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly maxTags?: number;
  readonly maxTagLength?: number;
  readonly separatorPattern?: string;
  readonly allowDuplicates?: boolean;
  readonly addOnBlur?: boolean;
  readonly pattern?: RegExp;
  readonly validator?: (value: string) => boolean | string;
  readonly ariaLabel?: string;
}
