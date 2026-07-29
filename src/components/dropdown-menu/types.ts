export type KDropdownMenuAlign = "start" | "end";
export type KDropdownMenuItemKey = string | number;

export interface KDropdownMenuItem {
  readonly key: KDropdownMenuItemKey;
  readonly label: string;
  readonly description?: string;
  readonly icon?: string;
  readonly groupLabel?: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly loading?: boolean;
  readonly requiresConfirmation?: boolean;
  readonly danger?: boolean;
  readonly separatorBefore?: boolean;
  readonly shortcut?: string;
}

export interface KDropdownMenuProps {
  readonly items: readonly KDropdownMenuItem[];
  readonly align?: KDropdownMenuAlign;
  readonly triggerLabel?: string;
  readonly disabled?: boolean;
  readonly closeOnSelect?: boolean;
  readonly minWidth?: string | number;
  readonly teleportTo?: string;
}
