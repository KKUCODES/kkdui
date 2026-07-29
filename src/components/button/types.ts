import type { Component } from "vue";

export type KButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type KButtonSize = "small" | "medium" | "large";
export type KButtonNativeType = "button" | "submit" | "reset";

export interface KButtonProps {
  readonly variant?: KButtonVariant;
  readonly size?: KButtonSize;
  readonly type?: KButtonNativeType;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly block?: boolean;
  readonly icon?: Component;
}
