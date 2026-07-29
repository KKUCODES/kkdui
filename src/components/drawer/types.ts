export type KDrawerSide = "left" | "right";
export type KDrawerCloseReason = "backdrop" | "close-button" | "escape";
export type KDrawerBeforeClose = (
  reason: KDrawerCloseReason
) => boolean | void | Promise<boolean | void>;

export interface KDrawerProps {
  readonly title?: string;
  readonly description?: string;
  readonly ariaLabel?: string;
  readonly side?: KDrawerSide;
  readonly width?: string | number;
  readonly showClose?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnEscape?: boolean;
  readonly teleportTo?: string;
  readonly beforeClose?: KDrawerBeforeClose;
  readonly mobileFullscreen?: boolean;
  readonly footerFixed?: boolean;
  readonly resizable?: boolean;
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly resizeStep?: number;
  readonly loading?: boolean;
  readonly error?: string;
}
