export type KFormSectionHeadingLevel = 2 | 3 | 4 | 5;

export interface KFormSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly collapsible?: boolean;
  readonly disabled?: boolean;
  readonly headingLevel?: KFormSectionHeadingLevel;
}
