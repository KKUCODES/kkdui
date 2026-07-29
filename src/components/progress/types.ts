export type KProgressTone = "primary" | "success" | "warning" | "danger";
export type KProgressSize = "small" | "medium";

export interface KProgressProps {
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly label?: string;
  readonly valueLabel?: string;
  readonly tone?: KProgressTone;
  readonly size?: KProgressSize;
  readonly showValue?: boolean;
  readonly indeterminate?: boolean;
}
