export type KTooltipPlacement =
  | "auto"
  | "top"
  | "bottom"
  | "left"
  | "right";

export interface KTooltipProps {
  readonly content?: string;
  readonly placement?: KTooltipPlacement;
  readonly disabled?: boolean;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly maxWidth?: string | number;
  readonly teleportTo?: string | HTMLElement;
}
