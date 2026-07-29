export type KSwitchSize = "small" | "medium";

export interface KSwitchProps {
  readonly id?: string;
  readonly name?: string;
  readonly label?: string;
  readonly description?: string;
  readonly size?: KSwitchSize;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly invalid?: boolean;
}
