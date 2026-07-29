<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { KFormItemProps } from "./types";

const props = withDefaults(defineProps<KFormItemProps>(), {
  label: "",
  hint: "",
  error: "",
  errors: () => [],
  required: false,
  labelDescription: "",
  currentLength: undefined,
  maxLength: undefined
});

const rootElement = ref<HTMLElement | null>(null);
const generatedId = useId();
const resolvedControlId = computed(
  () => props.controlId ?? `k-control-${generatedId}`
);
const hintId = computed(() =>
  props.hint ? `${resolvedControlId.value}-hint` : undefined
);
const errorMessages = computed(() =>
  [...new Set([props.error, ...props.errors].filter(Boolean))]
);
const errorId = computed(() =>
  errorMessages.value.length > 0
    ? `${resolvedControlId.value}-error`
    : undefined
);
const describedBy = computed(() =>
  [hintId.value, errorId.value].filter(Boolean).join(" ") || undefined
);
const limitText = computed(() => {
  if (props.maxLength === undefined) {
    return "";
  }
  return `${Math.max(0, props.currentLength ?? 0)} / ${props.maxLength}`;
});

function focusControl(): void {
  const control = rootElement.value?.querySelector<HTMLElement>(
    `#${CSS.escape(resolvedControlId.value)}`
  );
  control?.focus({ preventScroll: true });
  rootElement.value?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

defineExpose({ focusControl });
</script>

<template>
  <div
    ref="rootElement"
    class="k-form-item"
    :class="{ 'k-form-item--invalid': errorMessages.length > 0 }"
    :data-form-item-invalid="errorMessages.length > 0 || undefined"
  >
    <div v-if="label || $slots.label" class="k-form-item__label-row">
      <label class="k-form-item__label" :for="resolvedControlId">
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="k-form-item__required" aria-hidden="true">*</span>
      </label>
      <span
        v-if="labelDescription || $slots['label-extra']"
        class="k-form-item__label-extra"
        :title="labelDescription || undefined"
      >
        <slot name="label-extra">{{ labelDescription }}</slot>
      </span>
    </div>
    <slot
      :control-id="resolvedControlId"
      :described-by="describedBy"
      :invalid="errorMessages.length > 0"
    />
    <div
      v-if="hint || limitText || $slots.limit"
      class="k-form-item__support"
    >
      <p v-if="hint" :id="hintId" class="k-form-item__hint">{{ hint }}</p>
      <span v-if="limitText || $slots.limit" class="k-form-item__limit">
        <slot name="limit">{{ limitText }}</slot>
      </span>
    </div>
    <ul
      v-if="errorMessages.length > 0"
      :id="errorId"
      class="k-form-item__errors"
      role="alert"
    >
      <li v-for="message in errorMessages" :key="message">{{ message }}</li>
    </ul>
  </div>
</template>

<style scoped>
.k-form-item {
  display: grid;
  gap: 0.5rem;
}

.k-form-item__label-row,
.k-form-item__support {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.k-form-item__label {
  width: fit-content;
  color: var(--k-color-text, #1d2725);
  font-size: 0.78rem;
  font-weight: 620;
  letter-spacing: 0.01em;
}

.k-form-item__label-extra {
  overflow: hidden;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-form-item__required {
  margin-left: 0.2rem;
  color: var(--k-color-danger, #b34a4a);
}

.k-form-item__hint,
.k-form-item__error {
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.5;
}

.k-form-item__hint {
  color: var(--k-color-text-muted, #65706d);
}

.k-form-item__errors {
  display: grid;
  gap: 0.15rem;
  padding: 0;
  list-style: none;
}

.k-form-item__errors {
  color: var(--k-color-danger, #b34a4a);
}

.k-form-item__limit {
  margin-left: auto;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .k-form-item {
    scroll-behavior: auto;
  }
}
</style>
