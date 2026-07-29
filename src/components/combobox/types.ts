export type KComboboxValue = string | number;
export type KComboboxSize = "small" | "medium" | "large";

export interface KComboboxOption {
  readonly label: string;
  readonly value: KComboboxValue;
  readonly disabled?: boolean;
  readonly description?: string;
}

export interface KComboboxProps {
  readonly options: readonly KComboboxOption[];
  readonly id?: string;
  readonly name?: string;
  readonly placeholder?: string;
  readonly size?: KComboboxSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly clearable?: boolean;
  readonly loading?: boolean;
  readonly remote?: boolean;
  readonly remoteDebounce?: number;
  readonly remoteMethod?: (
    query: string
  ) => Promise<readonly KComboboxOption[] | void> | readonly KComboboxOption[] | void;
  readonly noResultText?: string;
  readonly loadingText?: string;
  readonly ariaLabel?: string;
}
