<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref
} from "vue";
import { CopyIcon } from "../../icons";
import CheckLargeIcon from "../../icons/internal/CheckLargeIcon.vue";
import type {
  KCopyButtonProps,
  KCopyButtonState
} from "./types";

const props = withDefaults(defineProps<KCopyButtonProps>(), {
  label: "复制",
  successLabel: "已复制",
  errorLabel: "复制失败",
  disabled: false,
  iconOnly: false,
  resetDelay: 1800
});

const emit = defineEmits<{
  success: [value: string];
  error: [error: unknown];
}>();

const state = ref<KCopyButtonState>("idle");
let resetTimer: ReturnType<typeof setTimeout> | undefined;

const currentLabel = computed(() => {
  if (state.value === "success") {
    return props.successLabel;
  }
  if (state.value === "error") {
    return props.errorLabel;
  }
  return props.label;
});

function scheduleReset(): void {
  if (resetTimer !== undefined) {
    clearTimeout(resetTimer);
  }
  resetTimer = setTimeout(() => {
    state.value = "idle";
  }, Math.max(0, props.resetDelay));
}

async function copy(): Promise<void> {
  if (props.disabled || state.value === "copying") {
    return;
  }

  state.value = "copying";
  const text = String(props.value);
  try {
    if (navigator.clipboard?.writeText === undefined) {
      throw new Error("Clipboard API is unavailable");
    }
    await navigator.clipboard.writeText(text);
    state.value = "success";
    emit("success", text);
  } catch (error) {
    state.value = "error";
    emit("error", error);
  }
  scheduleReset();
}

onBeforeUnmount(() => {
  if (resetTimer !== undefined) {
    clearTimeout(resetTimer);
  }
});

defineExpose({ copy });
</script>

<template>
  <button
    class="k-copy-button"
    :class="[
      `is-${state}`,
      { 'is-icon-only': iconOnly }
    ]"
    type="button"
    :disabled="disabled || state === 'copying'"
    :aria-label="iconOnly ? currentLabel : undefined"
    :title="iconOnly ? currentLabel : undefined"
    @click="copy"
  >
    <CopyIcon
      v-if="state !== 'success'"
      class="k-copy-button__icon"
    />
    <CheckLargeIcon
      v-else
      class="k-copy-button__icon"
    />
    <span v-if="!iconOnly" class="k-copy-button__label">
      <slot :state="state" :label="currentLabel">
        {{ currentLabel }}
      </slot>
    </span>
    <span class="k-copy-button__announcement" role="status" aria-live="polite">
      {{ state === "success" || state === "error" ? currentLabel : "" }}
    </span>
  </button>
</template>

<style scoped>
.k-copy-button {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
  border: 1px solid transparent;
  border-radius: 0.56rem;
  padding: 0.3rem 0.54rem;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 610;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 130ms ease-out,
    background-color 130ms ease-out,
    transform 90ms ease-out;
}

.k-copy-button:hover:not(:disabled) {
  color: var(--k-color-primary, #257360);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-copy-button:active:not(:disabled) {
  transform: scale(0.94);
}

.k-copy-button:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.1rem;
}

.k-copy-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.k-copy-button.is-icon-only {
  width: 2rem;
  padding: 0;
}

.k-copy-button.is-success {
  color: var(--k-color-success, #28745c);
}

.k-copy-button.is-error {
  color: var(--k-color-danger, #b34a4a);
}

.k-copy-button__icon {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.k-copy-button__announcement {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 40rem) {
  .k-copy-button {
    min-height: 2.75rem;
  }

  .k-copy-button.is-icon-only {
    width: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-copy-button {
    transition: color 100ms ease-out, background-color 100ms ease-out;
  }

  .k-copy-button:active:not(:disabled) {
    transform: none;
  }
}

@media (prefers-contrast: more) {
  .k-copy-button {
    border-color: currentColor;
  }
}
</style>
