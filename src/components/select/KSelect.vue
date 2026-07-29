<script setup lang="ts">
import {
  computed,
  ref,
  useAttrs,
  useId,
  type CSSProperties
} from "vue";
import type {
  KSelectProps,
  KSelectValue
} from "./types";

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<KSelectProps>(), {
  placeholder: "请选择",
  size: "medium",
  disabled: false,
  invalid: false,
  clearable: false
});

const emit = defineEmits<{
  change: [value: KSelectValue | null, event: Event];
  clear: [];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const model = defineModel<KSelectValue | null>({ default: null });
const attrs = useAttrs();
const generatedId = useId();
const selectElement = ref<HTMLSelectElement | null>(null);
const selectId = computed(() => props.id ?? `k-select-${generatedId}`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const selectAttrs = computed(() => {
  const {
    class: _className,
    style: _style,
    ...passthrough
  } = attrs;
  return passthrough;
});
const selectedValue = computed(() =>
  model.value === null ? "" : String(model.value)
);
const hasValue = computed(() => model.value !== null);

function handleChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  const nextValue =
    value === ""
      ? null
      : props.options.find((option) => String(option.value) === value)?.value ??
        null;

  model.value = nextValue;
  emit("change", nextValue, event);
}

function clear(): void {
  if (props.disabled || !hasValue.value) {
    return;
  }

  model.value = null;
  emit("clear");
  selectElement.value?.focus({ preventScroll: true });
}

function focus(): void {
  selectElement.value?.focus();
}

defineExpose({
  focus,
  clear
});
</script>

<template>
  <div
    class="k-select"
    :class="[
      rootClass,
      `k-select--${size}`,
      {
        'k-select--disabled': disabled,
        'k-select--invalid': invalid,
        'k-select--clearable': clearable && hasValue
      }
    ]"
    :style="rootStyle"
  >
    <select
      :id="selectId"
      ref="selectElement"
      class="k-select__control"
      v-bind="selectAttrs"
      :name="name"
      :value="selectedValue"
      :disabled="disabled"
      :aria-invalid="invalid"
      @change="handleChange"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <option value="" :disabled="!clearable">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="`${typeof option.value}-${option.value}`"
        :value="String(option.value)"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>

    <button
      v-if="clearable && hasValue"
      class="k-select__clear"
      type="button"
      :disabled="disabled"
      aria-label="清除选择"
      @click="clear"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m4 4 8 8M12 4l-8 8" />
      </svg>
    </button>

    <svg
      class="k-select__indicator"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  </div>
</template>

<style scoped>
.k-select {
  --k-select-height: 2.75rem;
  --k-select-font-size: 0.82rem;

  position: relative;
  width: 100%;
  min-width: 0;
  height: var(--k-select-height);
  color: var(--k-color-text, #1d2725);
}

.k-select--small {
  --k-select-height: 2.3rem;
  --k-select-font-size: 0.76rem;
}

.k-select--large {
  --k-select-height: 3.2rem;
  --k-select-font-size: 0.86rem;
}

.k-select__control {
  width: 100%;
  height: 100%;
  appearance: none;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.28));
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0 2.5rem 0 0.9rem;
  overflow: hidden;
  color: inherit;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  font: inherit;
  font-size: var(--k-select-font-size);
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    border-color 170ms ease-out,
    background-color 170ms ease-out,
    box-shadow 200ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-select--clearable .k-select__control {
  padding-right: 4.4rem;
}

.k-select__control:hover:not(:disabled) {
  border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.42));
}

.k-select__control:focus-visible {
  border-color: var(--k-color-primary, #257360);
  outline: 0;
  background: var(--k-color-control-surface-focus, rgba(255, 255, 255, 0.94));
  box-shadow:
    0 0 0 0.22rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k-select__indicator,
.k-select__clear {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.k-select__indicator {
  right: 0.85rem;
  width: 0.85rem;
  height: 0.85rem;
  fill: none;
  stroke: var(--k-color-text-muted, #65706d);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  pointer-events: none;
}

.k-select__clear {
  right: 2.05rem;
  width: 1.7rem;
  height: 1.7rem;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 140ms ease-out,
    background-color 140ms ease-out,
    transform 100ms ease-out;
}

.k-select__clear:hover:not(:disabled) {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-select__clear:active:not(:disabled) {
  transform: translateY(-50%) scale(0.9);
}

.k-select__clear:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.08rem;
}

.k-select__clear svg {
  width: 0.72rem;
  height: 0.72rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.k-select--invalid .k-select__control {
  border-color: var(--k-color-danger, #b34a4a);
}

.k-select--invalid .k-select__control:focus-visible {
  box-shadow:
    0 0 0 0.22rem var(--k-color-danger-ring, rgba(179, 74, 74, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k-select--disabled {
  opacity: 0.58;
}

.k-select--disabled .k-select__control,
.k-select--disabled .k-select__clear {
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .k-select__control,
  .k-select__clear {
    transition: color 100ms ease-out, background-color 100ms ease-out;
  }

  .k-select__clear:active:not(:disabled) {
    transform: translateY(-50%);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-select__control {
    background: var(--k-color-surface, #ffffff);
  }
}

@media (max-width: 40rem) {
  .k-select--small {
    --k-select-height: 2.75rem;
    --k-select-font-size: 0.82rem;
  }
}

@media (prefers-contrast: more) {
  .k-select__control {
    border-color: currentColor;
  }
}
</style>
