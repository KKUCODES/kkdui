export type KRefreshSource = "manual" | "auto";

export interface KRefreshControlProps {
  readonly modelValue?: number | null;
  readonly paused?: boolean;
  readonly options?: readonly number[];
  readonly refreshing?: boolean;
  readonly disabled?: boolean;
  readonly lastUpdated?: Date | string | number | null;
}
