export type KCopyButtonState = "idle" | "copying" | "success" | "error";

export interface KCopyButtonProps {
  readonly value: string | number;
  readonly label?: string;
  readonly successLabel?: string;
  readonly errorLabel?: string;
  readonly disabled?: boolean;
  readonly iconOnly?: boolean;
  readonly resetDelay?: number;
}
