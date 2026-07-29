import type { KCopyButtonState } from "../copy-button/types";

export type KDescriptionsKey = string | number;

export interface KDescriptionItem {
  readonly key: KDescriptionsKey;
  readonly label: string;
  readonly value?: string | number | null;
  readonly copyable?: boolean | string;
  readonly status?: string;
  readonly span?: number;
}

export interface KDescriptionsColumns {
  readonly mobile?: number;
  readonly tablet?: number;
  readonly desktop?: number;
}

export interface KDescriptionsProps {
  readonly items: readonly KDescriptionItem[];
  readonly columns?: number | KDescriptionsColumns;
  readonly bordered?: boolean;
  readonly emptyValue?: string;
  readonly ariaLabel?: string;
}

export interface KDescriptionCopySlotProps {
  readonly state: KCopyButtonState;
  readonly label: string;
}
