export type KDiffViewerMode = "auto" | "json" | "text";
export type KDiffLineType = "equal" | "added" | "removed" | "modified";

export interface KDiffLine {
  readonly key: string;
  readonly type: KDiffLineType;
  readonly before: string;
  readonly after: string;
}

export interface KDiffViewerProps {
  readonly before: unknown;
  readonly after: unknown;
  readonly mode?: KDiffViewerMode;
  readonly beforeLabel?: string;
  readonly afterLabel?: string;
  readonly showUnchanged?: boolean;
  readonly maxHeight?: string | number;
  readonly emptyText?: string;
}
