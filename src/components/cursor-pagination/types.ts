export interface KCursorPaginationProps {
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly previousLoading?: boolean;
  readonly nextLoading?: boolean;
  readonly batchLabel?: string;
  readonly previousLabel?: string;
  readonly nextLabel?: string;
  readonly ariaLabel?: string;
}
