export type KTableRowKey = string | number;
export type KTableAlign = "left" | "center" | "right";
export type KTableSize = "small" | "medium";
export type KTableSortDirection = "asc" | "desc";
export type KTableFixedSide = "left" | "right";
export type KTableRowStatus =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "muted";

export interface KTableSort {
  readonly key: string;
  readonly direction: KTableSortDirection;
}

export interface KTableColumn<TRow extends object = Record<string, unknown>> {
  readonly key: string;
  readonly title: string;
  readonly accessor?: keyof TRow | ((row: TRow, rowIndex: number) => unknown);
  readonly align?: KTableAlign;
  readonly width?: string | number;
  readonly minWidth?: string | number;
  readonly sortable?: boolean;
  readonly ellipsis?: boolean;
  readonly fixed?: KTableFixedSide;
  readonly hidden?: boolean;
  readonly headerHint?: string;
}

export interface KTableProps<TRow extends object = Record<string, unknown>> {
  readonly columns: readonly KTableColumn<TRow>[];
  readonly visibleColumnKeys?: readonly string[] | null;
  readonly rows: readonly TRow[];
  readonly rowKey: keyof TRow | ((row: TRow) => KTableRowKey);
  readonly caption?: string;
  readonly loading?: boolean;
  readonly loadingRowCount?: number;
  readonly error?: string;
  readonly emptyText?: string;
  readonly showRetry?: boolean;
  readonly selectable?: boolean;
  readonly selectedRowKeys?: readonly KTableRowKey[];
  readonly isRowSelectable?: (row: TRow) => boolean;
  readonly expandable?: boolean;
  readonly expandedRowKeys?: readonly KTableRowKey[];
  readonly isRowExpandable?: (row: TRow) => boolean;
  readonly sort?: KTableSort | null;
  readonly size?: KTableSize;
  readonly stickyHeader?: boolean;
  readonly maxHeight?: string | number;
  readonly minWidth?: string | number;
  readonly hoverable?: boolean;
  readonly interactiveRows?: boolean;
  readonly emptyValue?: string;
  readonly rowStatus?: (
    row: TRow,
    rowIndex: number
  ) => KTableRowStatus | undefined;
}
