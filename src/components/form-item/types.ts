export interface KFormItemProps {
  readonly label?: string;
  readonly controlId?: string;
  readonly hint?: string;
  readonly error?: string;
  readonly errors?: readonly string[];
  readonly required?: boolean;
  readonly labelDescription?: string;
  readonly currentLength?: number;
  readonly maxLength?: number;
}
