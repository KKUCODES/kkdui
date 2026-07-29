export type KPaginationSize = "small" | "medium";

export interface KPaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly pageSizeOptions?: readonly number[];
  readonly siblingCount?: number;
  readonly showTotal?: boolean;
  readonly showPageSize?: boolean;
  readonly hideOnSinglePage?: boolean;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly size?: KPaginationSize;
}
