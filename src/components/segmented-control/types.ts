export type KSegmentedValue = string | number;
export type KSegmentedControlSize = "small" | "medium" | "large";

export interface KSegmentedOption {
  readonly label: string;
  readonly value: KSegmentedValue;
  readonly disabled?: boolean;
}

export interface KSegmentedControlProps {
  readonly options: readonly KSegmentedOption[];
  readonly id?: string;
  readonly size?: KSegmentedControlSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly fullWidth?: boolean;
  readonly ariaLabel?: string;
}
