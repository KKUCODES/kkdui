export type KMultiSelectValue = string | number;
export type KMultiSelectSize = "small" | "medium" | "large";

export interface KMultiSelectOption {
  readonly label: string;
  readonly value: KMultiSelectValue;
  readonly disabled?: boolean;
  readonly description?: string;
}

export interface KMultiSelectProps {
  readonly options: readonly KMultiSelectOption[];
  readonly id?: string;
  readonly name?: string;
  readonly placeholder?: string;
  readonly size?: KMultiSelectSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly clearable?: boolean;
  readonly filterable?: boolean;
  readonly collapseTags?: boolean;
  readonly maxTagCount?: number;
  readonly noResultText?: string;
  readonly ariaLabel?: string;
}
