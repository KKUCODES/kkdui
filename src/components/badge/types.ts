export type KBadgeTone =
  | "neutral"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger";
export type KBadgeSize = "small" | "medium";
export type KBadgeStatus = "online" | "offline" | "connecting";

export interface KBadgeProps {
  readonly tone?: KBadgeTone;
  readonly size?: KBadgeSize;
  readonly dot?: boolean;
  readonly live?: boolean;
  readonly status?: KBadgeStatus;
  readonly wrap?: boolean;
  readonly maxWidth?: string | number;
}
