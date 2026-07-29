export type KTabValue = string | number;
export type KTabsActivation = "automatic" | "manual";
export type KTabsMobileMode = "scroll" | "select";
export type KTabBadgeTone = "neutral" | "accent" | "warning" | "danger";

export interface KTabItem {
  readonly value: KTabValue;
  readonly label: string;
  readonly disabled?: boolean;
  readonly badge?: string | number;
  readonly badgeTone?: KTabBadgeTone;
  readonly loading?: boolean;
  readonly error?: string;
}

export interface KTabsProps {
  readonly items: readonly KTabItem[];
  readonly ariaLabel?: string;
  readonly activation?: KTabsActivation;
  readonly stretch?: boolean;
  readonly unmountInactive?: boolean;
  readonly mobileMode?: KTabsMobileMode;
}
