export type KRadioValue = string | number;
export type KRadioGroupDirection = "horizontal" | "vertical";
export type KRadioGroupSize = "small" | "medium" | "large";

export interface KRadioOption {
  readonly label: string;
  readonly value: KRadioValue;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface KRadioGroupProps {
  readonly options: readonly KRadioOption[];
  readonly id?: string;
  readonly name?: string;
  readonly direction?: KRadioGroupDirection;
  readonly size?: KRadioGroupSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly ariaLabel?: string;
}
