<script setup lang="ts">
import { computed, markRaw, toRaw } from "vue";
import KIcon from "../icon/KIcon.vue";
import type { KButtonProps } from "./types";

const props = withDefaults(defineProps<KButtonProps>(), {
  variant: "primary",
  size: "medium",
  type: "button",
  loading: false,
  disabled: false,
  block: false
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const isDisabled = computed(() => props.disabled || props.loading);
const iconComponent = computed(() =>
  props.icon ? markRaw(toRaw(props.icon)) : undefined
);

function handleClick(event: MouseEvent): void {
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }

  emit("click", event);
}
</script>

<template>
  <button
    class="k-button"
    :class="[
      `k-button--${variant}`,
      `k-button--${size}`,
      { 'k-button--block': block }
    ]"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="k-button__spinner" aria-hidden="true"></span>
    <span v-else-if="$slots.icon || icon" class="k-button__leading">
      <KIcon>
        <slot name="icon">
          <component :is="iconComponent" />
        </slot>
      </KIcon>
    </span>
    <span v-else-if="$slots.leading" class="k-button__leading">
      <slot name="leading" />
    </span>
    <span class="k-button__content">
      <slot />
    </span>
    <span v-if="$slots.trailing" class="k-button__trailing">
      <slot name="trailing" />
    </span>
  </button>
</template>

<style scoped>
.k-button {
  --k-button-height: 2.75rem;
  --k-button-padding: 0 1rem;
  --k-button-font-size: 0.82rem;

  min-width: 0;
  height: var(--k-button-height);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 1px solid transparent;
  border-radius: var(--k-radius-control, 0.78rem);
  padding: var(--k-button-padding);
  font: inherit;
  font-size: var(--k-button-font-size);
  font-weight: 640;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    transform 220ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1)),
    color 160ms ease-out,
    border-color 160ms ease-out,
    background-color 160ms ease-out,
    box-shadow 220ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-button--small {
  --k-button-height: 2rem;
  --k-button-padding: 0 0.7rem;
  --k-button-font-size: 0.68rem;
}

.k-button--large {
  --k-button-height: 3.3rem;
  --k-button-padding: 0 1.1rem;
  --k-button-font-size: 0.86rem;
}

.k-button--block {
  width: 100%;
}

.k-button--primary {
  color: var(--k-color-on-primary, #ffffff);
  background: var(--k-color-primary, #257360);
  box-shadow:
    0 0.75rem 1.6rem -1rem rgba(24, 82, 68, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.k-button--primary:hover:not(:disabled) {
  background: var(--k-color-primary-hover, #1e604f);
  box-shadow:
    0 1rem 1.9rem -1rem rgba(24, 82, 68, 0.68),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transform: translateY(-0.08rem);
}

.k-button--secondary {
  border-color: var(--k-color-border, #c7d1cd);
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface, #ffffff);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.k-button--secondary:hover:not(:disabled),
.k-button--ghost:hover:not(:disabled) {
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.08));
}

.k-button--ghost {
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
}

.k-button--danger {
  color: var(--k-color-on-danger, #ffffff);
  background: var(--k-color-danger, #b34a4a);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.k-button--danger:hover:not(:disabled) {
  background: var(--k-color-danger-hover, #993f3f);
  transform: translateY(-0.08rem);
}

.k-button:active:not(:disabled) {
  transform: scale(0.975);
  transition-duration: 80ms;
}

.k-button:focus-visible {
  outline: 0.2rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.18rem;
}

.k-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.k-button[aria-busy="true"] {
  cursor: wait;
}

.k-button__leading,
.k-button__trailing,
.k-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.k-button__spinner {
  width: 0.85rem;
  height: 0.85rem;
  flex: 0 0 auto;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: k-button-spin 680ms linear infinite;
}

@keyframes k-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-button {
    transition: opacity 120ms ease-out, background-color 120ms ease-out;
  }

  .k-button:hover:not(:disabled),
  .k-button:active:not(:disabled) {
    transform: none;
  }

  .k-button__spinner {
    animation-duration: 1200ms;
  }
}

@media (max-width: 40rem) {
  .k-button--small {
    --k-button-height: 2.75rem;
    --k-button-padding: 0 0.9rem;
    --k-button-font-size: 0.76rem;
  }
}

@media (prefers-contrast: more) {
  .k-button {
    border-color: currentColor;
  }
}
</style>
