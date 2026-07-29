export interface KErrorStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly retryText?: string;
  readonly showRetry?: boolean;
  readonly retryLoading?: boolean;
  readonly minHeight?: string | number;
}
