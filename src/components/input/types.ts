export type KInputType =
  | "text"
  | "password"
  | "email"
  | "search"
  | "tel"
  | "url"
  | "datetime-local";
export type KInputSize = "small" | "medium" | "large";

export interface KInputProps {
  readonly id?: string;
  readonly type?: KInputType;
  readonly size?: KInputSize;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly revealable?: boolean;
}
