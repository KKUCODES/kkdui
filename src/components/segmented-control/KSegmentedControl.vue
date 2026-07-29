<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { KSegmentedControlProps, KSegmentedValue } from "./types";

const props = withDefaults(defineProps<KSegmentedControlProps>(), {
  size: "medium",
  disabled: false,
  invalid: false,
  fullWidth: false,
  ariaLabel: "分段选择"
});

const emit = defineEmits<{ change: [value: KSegmentedValue] }>();
const model = defineModel<KSegmentedValue | null>({ default: null });
const generatedId = useId();
const groupId = computed(() => props.id ?? `k-segmented-${generatedId}`);
const buttons = ref<HTMLButtonElement[]>([]);

function setButton(element: Element | null, index: number): void {
  if (element instanceof HTMLButtonElement) buttons.value[index] = element;
}

function select(value: KSegmentedValue): void {
  if (props.disabled || model.value === value) return;
  model.value = value;
  emit("change", value);
}

function handleKeydown(event: KeyboardEvent, currentIndex: number): void {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const available = props.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled);
  if (available.length === 0) return;
  const position = available.findIndex(({ index }) => index === currentIndex);
  let nextPosition = position;
  if (event.key === "Home") nextPosition = 0;
  else if (event.key === "End") nextPosition = available.length - 1;
  else {
    const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    nextPosition = (Math.max(0, position) + direction + available.length) % available.length;
  }
  const next = available[nextPosition]!;
  select(next.option.value);
  buttons.value[next.index]?.focus();
}

function tabIndex(value: KSegmentedValue, disabled: boolean | undefined): number {
  if (props.disabled || disabled) return -1;
  if (model.value === value) return 0;
  const hasSelection = props.options.some((option) => option.value === model.value && !option.disabled);
  if (!hasSelection) return props.options.find((option) => !option.disabled)?.value === value ? 0 : -1;
  return -1;
}
</script>

<template>
  <div
    :id="groupId"
    class="k-segmented"
    :class="[
      `k-segmented--${size}`,
      {
        'k-segmented--disabled': disabled,
        'k-segmented--invalid': invalid,
        'k-segmented--full-width': fullWidth
      }
    ]"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-invalid="invalid"
    :aria-disabled="disabled"
  >
    <button
      v-for="(option, index) in options"
      :key="`${typeof option.value}-${option.value}`"
      :ref="(element) => setButton(element as Element | null, index)"
      class="k-segmented__item"
      :class="{ 'k-segmented__item--selected': model === option.value }"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      :disabled="disabled || option.disabled"
      :tabindex="tabIndex(option.value, option.disabled)"
      @click="select(option.value)"
      @keydown="handleKeydown($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.k-segmented {
  --k-segment-height: 2.35rem;
  --k-segment-font-size: 0.76rem;
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  gap: 0.18rem;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.2));
  border-radius: calc(var(--k-radius-control, 0.78rem) + 0.08rem);
  padding: 0.18rem;
  background: var(--k-color-surface-muted, rgba(99, 116, 111, 0.08));
}
.k-segmented--small { --k-segment-height: 2rem; --k-segment-font-size: 0.72rem; }
.k-segmented--large { --k-segment-height: 2.8rem; --k-segment-font-size: 0.84rem; }
.k-segmented--full-width { width: 100%; }
.k-segmented__item {
  min-width: 3rem;
  height: var(--k-segment-height);
  flex: 1 1 auto;
  border: 0;
  border-radius: var(--k-radius-control, 0.68rem);
  padding: 0 0.85rem;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-size: var(--k-segment-font-size);
  font-weight: 570;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  transition: color 140ms ease-out, background-color 170ms ease-out, box-shadow 190ms ease-out, transform 90ms ease-out;
}
.k-segmented__item:hover:not(:disabled):not(.k-segmented__item--selected) {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.06));
}
.k-segmented__item--selected {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface, #fff);
  box-shadow: 0 0.1rem 0.32rem rgba(26, 50, 44, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.k-segmented__item:active:not(:disabled) { transform: scale(0.97); }
.k-segmented__item:focus-visible { outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17)); outline-offset: 0.08rem; }
.k-segmented__item:disabled { cursor: not-allowed; opacity: 0.42; }
.k-segmented--invalid { border-color: var(--k-color-danger, #b34a4a); }
.k-segmented--disabled { opacity: 0.58; }
@media (max-width: 40rem) {
  .k-segmented--small { --k-segment-height: 2.4rem; --k-segment-font-size: 0.78rem; }
}
@media (prefers-reduced-motion: reduce) {
  .k-segmented__item { transition: color 100ms ease-out, background-color 100ms ease-out; }
  .k-segmented__item:active:not(:disabled) { transform: none; }
}
@media (prefers-reduced-transparency: reduce) { .k-segmented { background: var(--k-color-surface-muted, #eef1f0); } }
@media (prefers-contrast: more) { .k-segmented { border-color: currentColor; } }
</style>
