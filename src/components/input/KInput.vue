<script setup lang="ts">
import {
  computed,
  ref,
  useAttrs,
  useId,
  type CSSProperties
} from "vue";
import type { KInputProps } from "./types";

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<KInputProps>(), {
  type: "text",
  size: "medium",
  invalid: false,
  disabled: false,
  readonly: false,
  revealable: false
});

const emit = defineEmits<{
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const model = defineModel<string>({ default: "" });
const attrs = useAttrs();
const generatedId = useId();
const inputElement = ref<HTMLInputElement | null>(null);
const passwordVisible = ref(false);

const inputId = computed(() => props.id ?? `k-input-${generatedId}`);
const resolvedType = computed(() =>
  props.type === "password" && props.revealable && passwordVisible.value
    ? "text"
    : props.type
);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const inputAttrs = computed(() => {
  const {
    class: _className,
    style: _style,
    ...passthrough
  } = attrs;
  return passthrough;
});

function handleInput(event: Event): void {
  model.value = (event.target as HTMLInputElement).value;
}

function togglePasswordVisibility(): void {
  passwordVisible.value = !passwordVisible.value;
  inputElement.value?.focus();
}

function focus(): void {
  inputElement.value?.focus();
}

function blur(): void {
  inputElement.value?.blur();
}

function select(): void {
  inputElement.value?.select();
}

defineExpose({
  focus,
  blur,
  select
});
</script>

<template>
  <div
    class="k-input"
    :class="[
      rootClass,
      `k-input--${size}`,
      {
        'k-input--invalid': invalid,
        'k-input--disabled': disabled
      }
    ]"
    :style="rootStyle"
  >
    <span v-if="$slots.prefix" class="k-input__prefix">
      <slot name="prefix" />
    </span>
    <input
      :id="inputId"
      ref="inputElement"
      class="k-input__control"
      v-bind="inputAttrs"
      :value="model"
      :type="resolvedType"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="invalid"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <button
      v-if="type === 'password' && revealable"
      class="k-input__action"
      type="button"
      :disabled="disabled"
      :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
      @click="togglePasswordVisibility"
    >
      {{ passwordVisible ? "隐藏" : "显示" }}
    </button>
    <span v-else-if="$slots.suffix" class="k-input__suffix">
      <slot name="suffix" />
    </span>
  </div>
</template>

<style scoped>
.k-input {
  --k-input-height: 3rem;
  --k-input-font-size: 0.86rem;

  width: 100%;
  min-width: 0;
  height: var(--k-input-height);
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.32));
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0 0.9rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
  transition:
    border-color 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1)),
    box-shadow 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1)),
    background-color 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-input--small {
  --k-input-height: 2.3rem;
  --k-input-font-size: 0.78rem;
}

.k-input--large {
  --k-input-height: 3.2rem;
  --k-input-font-size: 0.88rem;
}

.k-input:hover:not(.k-input--disabled) {
  border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.46));
}

.k-input:focus-within {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-control-surface-focus, rgba(255, 255, 255, 0.94));
  box-shadow:
    0 0 0 0.22rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k-input--invalid {
  border-color: var(--k-color-danger, #b34a4a);
}

.k-input--invalid:focus-within {
  box-shadow:
    0 0 0 0.22rem var(--k-color-danger-ring, rgba(179, 74, 74, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k-input--disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.k-input__control {
  min-width: 0;
  height: 100%;
  flex: 1;
  border: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: var(--k-input-font-size);
  outline: none;
}

.k-input__control::placeholder {
  color: var(--k-color-text-subtle, #929d99);
}

.k-input__control:disabled {
  cursor: not-allowed;
}

.k-input__prefix,
.k-input__suffix {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  color: var(--k-color-text-muted, #65706d);
}

.k-input__action {
  flex: 0 0 auto;
  border: 0;
  border-radius: 0.4rem;
  padding: 0.2rem 0.35rem;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 140ms ease-out,
    background-color 140ms ease-out,
    transform 200ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-input__action:hover:not(:disabled) {
  color: var(--k-color-primary, #257360);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-input__action:active:not(:disabled) {
  transform: scale(0.94);
  transition-duration: 80ms;
}

.k-input__action:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

@media (prefers-reduced-motion: reduce) {
  .k-input,
  .k-input__action {
    transition: border-color 120ms ease-out, background-color 120ms ease-out;
  }

  .k-input__action:active:not(:disabled) {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-input {
    background: var(--k-color-surface, #ffffff);
  }
}

@media (max-width: 40rem) {
  .k-input--small {
    --k-input-height: 2.75rem;
    --k-input-font-size: 0.82rem;
  }
}

@media (prefers-contrast: more) {
  .k-input {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
