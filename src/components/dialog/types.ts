export type KDialogSize = "small" | "medium" | "large";
export type KDialogRole = "dialog" | "alertdialog";
export type KDialogCloseReason = "backdrop" | "close-button" | "escape";
export type KDialogBeforeClose = (
  reason: KDialogCloseReason
) => boolean | void | Promise<boolean | void>;

export interface KDialogProps {
  readonly title?: string;
  readonly description?: string;
  readonly ariaLabel?: string;
  readonly size?: KDialogSize;
  readonly role?: KDialogRole;
  readonly showClose?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnEscape?: boolean;
  readonly teleportTo?: string;
  readonly beforeClose?: KDialogBeforeClose;
  readonly mobileFullscreen?: boolean;
  readonly footerFixed?: boolean;
  readonly form?: string;
}
