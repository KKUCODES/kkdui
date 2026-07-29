export type KStatCardTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger";

export interface KStatCardProps {
  readonly label: string;
  readonly value?: string | number | null;
  readonly unit?: string;
  readonly change?: number | null;
  readonly changeLabel?: string;
  readonly tone?: KStatCardTone;
  readonly loading?: boolean;
  readonly error?: string;
}
