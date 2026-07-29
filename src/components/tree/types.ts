export type KTreeKey = string | number;

export interface KTreeNode {
  readonly key: KTreeKey;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly children?: readonly KTreeNode[];
}

export interface KTreeProps {
  readonly nodes: readonly KTreeNode[];
  readonly ariaLabel?: string;
  readonly checkable?: boolean;
  readonly checkStrictly?: boolean;
  readonly searchable?: boolean;
  readonly showToolbar?: boolean;
  readonly searchPlaceholder?: string;
  readonly emptyText?: string;
}

export interface KTreeVisibleNode {
  readonly node: KTreeNode;
  readonly level: number;
  readonly parentKey?: KTreeKey;
}
