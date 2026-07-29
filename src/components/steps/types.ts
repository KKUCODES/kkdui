export type KStepValue = string | number;
export type KStepStatus = "pending" | "current" | "complete" | "error";
export type KStepsOrientation = "horizontal" | "vertical";

export interface KStepItem {
  readonly value: KStepValue;
  readonly title: string;
  readonly description?: string;
  readonly status?: KStepStatus;
  readonly disabled?: boolean;
}

export interface KStepsProps {
  readonly items: readonly KStepItem[];
  readonly modelValue?: KStepValue | null;
  readonly orientation?: KStepsOrientation;
  readonly clickable?: boolean;
  readonly ariaLabel?: string;
}
