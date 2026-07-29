export type KTimelineTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export interface KTimelineItem {
  readonly key: string | number;
  readonly title: string;
  readonly description?: string;
  readonly timestamp?: string;
  readonly datetime?: string;
  readonly actor?: string;
  readonly tone?: KTimelineTone;
  readonly status?: string;
}

export interface KTimelineProps {
  readonly items: readonly KTimelineItem[];
  readonly ariaLabel?: string;
  readonly compact?: boolean;
  readonly pending?: boolean;
  readonly pendingText?: string;
  readonly emptyText?: string;
}
