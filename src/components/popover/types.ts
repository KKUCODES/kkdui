export type KPopoverPlacement =
  | "auto"
  | "top"
  | "bottom"
  | "left"
  | "right";
export type KPopoverAlign = "start" | "center" | "end";

export interface KPopoverProps {
  readonly title?: string;
  readonly description?: string;
  readonly placement?: KPopoverPlacement;
  readonly align?: KPopoverAlign;
  readonly width?: string | number;
  readonly disabled?: boolean;
  readonly showClose?: boolean;
  readonly closeOnEscape?: boolean;
  readonly closeOnOutside?: boolean;
  readonly initialFocus?: boolean;
  readonly teleportTo?: string | HTMLElement;
}
