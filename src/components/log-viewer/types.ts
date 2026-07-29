export type KLogLevel =
  | "debug"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface KLogEntry {
  readonly id: string | number;
  readonly timestamp?: string | number | Date;
  readonly level: KLogLevel;
  readonly message: string;
  readonly source?: string;
}

export interface KLogViewerProps {
  readonly entries: readonly KLogEntry[];
  readonly height?: number;
  readonly rowHeight?: number;
  readonly overscan?: number;
  readonly query?: string;
  readonly paused?: boolean;
  readonly autoScroll?: boolean;
  readonly levels?: readonly KLogLevel[];
  readonly emptyText?: string;
}
