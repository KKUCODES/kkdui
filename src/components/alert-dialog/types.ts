import type { KButtonVariant } from "../button/types";

export type KAlertDialogTone = "warning" | "danger";

export interface KAlertDialogConfirmPayload {
  readonly confirmationValue: string;
  readonly reason: string;
}

export interface KAlertDialogProps {
  readonly title: string;
  readonly description?: string;
  readonly tone?: KAlertDialogTone;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly confirmVariant?: KButtonVariant;
  readonly confirmLoading?: boolean;
  readonly confirmDisabled?: boolean;
  readonly closeOnEscape?: boolean;
  readonly teleportTo?: string;
  readonly confirmationText?: string;
  readonly confirmationValue?: string;
  readonly confirmationInputLabel?: string;
  readonly reason?: string;
  readonly showReason?: boolean;
  readonly reasonRequired?: boolean;
  readonly reasonMinLength?: number;
  readonly reasonMaxLength?: number;
  readonly reasonLabel?: string;
  readonly reasonPlaceholder?: string;
  readonly confirmCountdown?: number;
}
