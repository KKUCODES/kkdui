<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch, type CSSProperties } from "vue";
import type { KNumberInputProps } from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<KNumberInputProps>(), {
  placeholder: "",
  step: 1,
  precision: 0,
  maxSafeValue: Number.MAX_SAFE_INTEGER,
  size: "medium",
  disabled: false,
  readonly: false,
  invalid: false,
  controls: true
});

const emit = defineEmits<{
  change: [value: number | null];
  invalidInput: [rawValue: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const model = defineModel<number | null>({ default: null });
const attrs = useAttrs();
const generatedId = useId();
const input = ref<HTMLInputElement | null>(null);
const editing = ref(false);
const inputId = computed(() => props.id ?? `k-number-input-${generatedId}`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const normalizedPrecision = computed(() =>
  Math.min(12, Math.max(0, Math.trunc(Number.isFinite(props.precision) ? props.precision : 0)))
);
const safeLimit = computed(() =>
  Number.isFinite(props.maxSafeValue) && props.maxSafeValue > 0
    ? Math.min(props.maxSafeValue, Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER
);
const effectiveMin = computed(() =>
  props.min === undefined ? -safeLimit.value : Math.max(props.min, -safeLimit.value)
);
const effectiveMax = computed(() =>
  props.max === undefined ? safeLimit.value : Math.min(props.max, safeLimit.value)
);
const safeStep = computed(() =>
  Number.isFinite(props.step) && props.step !== 0 ? Math.abs(props.step) : 1
);
const text = ref(format(model.value));
const canDecrease = computed(() =>
  !props.disabled && !props.readonly &&
  (model.value === null || model.value > effectiveMin.value)
);
const canIncrease = computed(() =>
  !props.disabled && !props.readonly &&
  (model.value === null || model.value < effectiveMax.value)
);

function format(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "";
  return normalizedPrecision.value > 0
    ? value.toFixed(normalizedPrecision.value)
    : String(Math.round(value));
}

function round(value: number): number {
  const factor = 10 ** normalizedPrecision.value;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function normalize(value: number): number {
  return round(Math.min(effectiveMax.value, Math.max(effectiveMin.value, value)));
}

function parse(raw: string): number | null {
  if (raw === "" || raw === "-" || raw === "." || raw === "-.") return null;
  if (!/^-?\d*(?:\.\d*)?$/.test(raw)) return null;
  const fraction = raw.split(".")[1];
  if (normalizedPrecision.value === 0 && raw.includes(".")) return null;
  if (fraction !== undefined && fraction.length > normalizedPrecision.value) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || Math.abs(value) > safeLimit.value) return null;
  return value;
}

function commit(value: number | null): void {
  if (model.value === value) return;
  model.value = value;
  emit("change", value);
}

function handleInput(event: Event): void {
  const element = event.target as HTMLInputElement;
  const original = element.value;
  const raw = original.replace(/[^\d.-]/g, "");
  if (raw !== original) {
    element.value = raw;
    emit("invalidInput", original);
  }
  const validShape = /^-?\d*(?:\.\d*)?$/.test(raw);
  if (!validShape || (raw.match(/\./g)?.length ?? 0) > 1) {
    element.value = text.value;
    emit("invalidInput", original);
    return;
  }
  text.value = raw;
  const value = parse(raw);
  if (value !== null) {
    if (value > effectiveMax.value || value < effectiveMin.value) {
      emit("invalidInput", raw);
      return;
    }
    commit(round(value));
  } else if (raw === "") {
    commit(null);
  } else if (!["-", ".", "-."].includes(raw)) {
    emit("invalidInput", raw);
  }
}

function finalize(): void {
  editing.value = false;
  const value = parse(text.value);
  if (value === null) {
    text.value = format(model.value);
    return;
  }
  const next = normalize(value);
  commit(next);
  text.value = format(next);
}

function stepBy(direction: 1 | -1): void {
  if (props.disabled || props.readonly) return;
  const base = model.value ?? (direction > 0 ? Math.max(0, effectiveMin.value) : Math.min(0, effectiveMax.value));
  const next = normalize(base + safeStep.value * direction);
  commit(next);
  text.value = format(next);
  input.value?.focus({ preventScroll: true });
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    stepBy(1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    stepBy(-1);
  } else if (event.key === "Enter") {
    finalize();
  }
}

watch(
  () => model.value,
  (value) => {
    if (!editing.value) text.value = format(value);
  }
);
watch(
  () => [props.precision, props.min, props.max, props.maxSafeValue],
  () => {
    if (!editing.value) text.value = format(model.value);
  }
);

defineExpose({ focus: () => input.value?.focus(), blur: () => input.value?.blur() });
</script>

<template>
  <div
    class="k-number-input"
    :class="[
      rootClass,
      `k-number-input--${size}`,
      {
        'k-number-input--disabled': disabled,
        'k-number-input--invalid': invalid,
        'k-number-input--with-controls': controls
      }
    ]"
    :style="rootStyle"
  >
    <button
      v-if="controls"
      class="k-number-input__button"
      type="button"
      :disabled="!canDecrease"
      aria-label="减少"
      tabindex="-1"
      @click="stepBy(-1)"
    >−</button>
    <input
      :id="inputId"
      ref="input"
      class="k-number-input__control"
      v-bind="controlAttrs"
      role="spinbutton"
      type="text"
      inputmode="decimal"
      autocomplete="off"
      :name="name"
      :value="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="invalid"
      :aria-valuemin="effectiveMin"
      :aria-valuemax="effectiveMax"
      :aria-valuenow="model ?? undefined"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="editing = true; emit('focus', $event)"
      @blur="finalize(); emit('blur', $event)"
    />
    <button
      v-if="controls"
      class="k-number-input__button"
      type="button"
      :disabled="!canIncrease"
      aria-label="增加"
      tabindex="-1"
      @click="stepBy(1)"
    >+</button>
  </div>
</template>

<style scoped>
.k-number-input {
  --k-number-height: 2.75rem;
  --k-number-font-size: 0.82rem;
  width: 100%;
  min-width: 0;
  height: var(--k-number-height);
  display: flex;
  align-items: stretch;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.32));
  border-radius: var(--k-radius-control, 0.78rem);
  overflow: hidden;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  transition: border-color 170ms ease-out, box-shadow 180ms ease-out, background-color 170ms ease-out;
}
.k-number-input--small { --k-number-height: 2.3rem; --k-number-font-size: 0.76rem; }
.k-number-input--large { --k-number-height: 3.2rem; --k-number-font-size: 0.88rem; }
.k-number-input:hover:not(.k-number-input--disabled) { border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.46)); }
.k-number-input:focus-within {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-control-surface-focus, rgba(255, 255, 255, 0.94));
  box-shadow: 0 0 0 0.22rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12));
}
.k-number-input--invalid { border-color: var(--k-color-danger, #b34a4a); }
.k-number-input--invalid:focus-within { box-shadow: 0 0 0 0.22rem var(--k-color-danger-ring, rgba(179, 74, 74, 0.12)); }
.k-number-input--disabled { opacity: 0.58; }
.k-number-input__control {
  min-width: 0;
  height: 100%;
  flex: 1;
  border: 0;
  padding: 0 0.85rem;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: var(--k-number-font-size);
  text-align: right;
  outline: 0;
}
.k-number-input__control::placeholder { color: var(--k-color-text-subtle, #929d99); }
.k-number-input__button {
  width: var(--k-number-height);
  flex: 0 0 auto;
  border: 0;
  border-right: 1px solid var(--k-color-divider, rgba(114, 131, 126, 0.16));
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
  touch-action: manipulation;
  transition: color 120ms ease-out, background-color 120ms ease-out, transform 80ms ease-out;
}
.k-number-input__button:last-child { border-right: 0; border-left: 1px solid var(--k-color-divider, rgba(114, 131, 126, 0.16)); }
.k-number-input__button:hover:not(:disabled) { color: var(--k-color-primary, #257360); background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07)); }
.k-number-input__button:active:not(:disabled) { transform: scale(0.92); }
.k-number-input__button:disabled { cursor: not-allowed; opacity: 0.38; }
@media (max-width: 40rem) {
  .k-number-input--small { --k-number-height: 2.75rem; --k-number-font-size: 0.82rem; }
}
@media (prefers-reduced-motion: reduce) {
  .k-number-input, .k-number-input__button { transition: color 100ms ease-out, background-color 100ms ease-out; }
  .k-number-input__button:active:not(:disabled) { transform: none; }
}
@media (prefers-reduced-transparency: reduce) { .k-number-input { background: var(--k-color-surface, #fff); } }
@media (prefers-contrast: more) { .k-number-input { border-color: currentColor; } }
</style>
