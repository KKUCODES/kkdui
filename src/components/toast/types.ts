export type KToastTone = "info" | "success" | "warning" | "danger";
export type KToastPosition = "top-right" | "bottom-right";

export interface KToastOptions {
  readonly description?: string;
  readonly duration?: number;
  readonly dismissible?: boolean;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly persistent?: boolean;
  readonly progress?: number;
  readonly progressLabel?: string;
  readonly dedupeKey?: string;
}

export interface KToastInput extends KToastOptions {
  readonly title: string;
  readonly tone?: KToastTone;
}

export interface KToastRecord extends KToastInput {
  readonly id: string;
  readonly tone: KToastTone;
  readonly duration: number;
  readonly dismissible: boolean;
  readonly persistent: boolean;
}

export interface KToastProps {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly tone?: KToastTone;
  readonly duration?: number;
  readonly dismissible?: boolean;
  readonly actionLabel?: string;
  readonly persistent?: boolean;
  readonly progress?: number;
  readonly progressLabel?: string;
}

export interface KToastProviderProps {
  readonly maxToasts?: number;
  readonly defaultDuration?: number;
  readonly position?: KToastPosition;
  readonly teleportTo?: string;
}

export interface KToastApi {
  show(input: KToastInput): string;
  info(title: string, options?: KToastOptions): string;
  success(title: string, options?: KToastOptions): string;
  warning(title: string, options?: KToastOptions): string;
  danger(title: string, options?: KToastOptions): string;
  update(id: string, input: Partial<KToastInput>): boolean;
  promise<T, TError = unknown>(
    task: Promise<T>,
    states: KToastPromiseStates<T, TError>
  ): Promise<T>;
  dismiss(id: string): void;
  clear(): void;
}

export type KToastPromiseMessage<T> =
  | string
  | KToastInput
  | ((value: T) => string | KToastInput);

export interface KToastPromiseStates<T, TError = unknown> {
  readonly loading: string | KToastInput;
  readonly success: KToastPromiseMessage<T>;
  readonly error: KToastPromiseMessage<TError>;
  readonly dedupeKey?: string;
}
