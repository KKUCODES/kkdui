export type KNumberInputSize = "small" | "medium" | "large";

export interface KNumberInputProps {
  readonly id?: string;
  readonly name?: string;
  readonly placeholder?: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly precision?: number;
  readonly maxSafeValue?: number;
  readonly size?: KNumberInputSize;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly invalid?: boolean;
  readonly controls?: boolean;
}
