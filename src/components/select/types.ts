export type KSelectValue = string | number;
export type KSelectSize = "small" | "medium" | "large";

export interface KSelectOption {
  readonly label: string;
  readonly value: KSelectValue;
  readonly disabled?: boolean;
}

export interface KSelectProps {
  readonly options: readonly KSelectOption[];
  readonly id?: string;
  readonly name?: string;
  readonly placeholder?: string;
  readonly size?: KSelectSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly clearable?: boolean;
}
