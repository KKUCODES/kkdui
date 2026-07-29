export type KTextareaSize = "small" | "medium" | "large";

export interface KTextareaProps {
  readonly id?: string;
  readonly name?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly minRows?: number;
  readonly maxRows?: number;
  readonly maxlength?: number;
  readonly showCount?: boolean;
  readonly autoResize?: boolean;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly invalid?: boolean;
  readonly size?: KTextareaSize;
}
