<script setup lang="ts">
import {
  computed,
  provide,
  ref
} from "vue";
import KToast from "./KToast.vue";
import { kToastKey } from "./context";
import type {
  KToastApi,
  KToastInput,
  KToastOptions,
  KToastPromiseMessage,
  KToastPromiseStates,
  KToastProviderProps,
  KToastRecord,
  KToastTone
} from "./types";

const props = withDefaults(defineProps<KToastProviderProps>(), {
  maxToasts: 4,
  defaultDuration: 4500,
  position: "top-right",
  teleportTo: "body"
});

const toasts = ref<KToastRecord[]>([]);
let toastSequence = 0;
const normalizedMaxToasts = computed(() =>
  Math.max(
    1,
    Math.trunc(Number.isFinite(props.maxToasts) ? props.maxToasts : 4)
  )
);

function dismiss(id: string): void {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

function clear(): void {
  toasts.value = [];
}

function show(input: KToastInput): string {
  const dedupeKey = getDedupeKey(input);
  const existingToast = dedupeKey === undefined
    ? undefined
    : toasts.value.find((toast) => toast.dedupeKey === dedupeKey);
  if (existingToast !== undefined) {
    update(existingToast.id, {
      ...input,
      dedupeKey
    });
    return existingToast.id;
  }

  toastSequence += 1;
  const id = `k-toast-${Date.now()}-${toastSequence}`;
  const persistent =
    input.persistent ?? input.progress !== undefined;
  const toast: KToastRecord = {
    ...input,
    id,
    tone: input.tone ?? "info",
    duration: persistent ? 0 : input.duration ?? props.defaultDuration,
    dismissible: input.dismissible ?? true,
    persistent,
    dedupeKey
  };

  toasts.value = [
    ...toasts.value,
    toast
  ].slice(-normalizedMaxToasts.value);
  return id;
}

function update(id: string, input: Partial<KToastInput>): boolean {
  let didUpdate = false;
  toasts.value = toasts.value.map((toast) => {
    if (toast.id !== id) {
      return toast;
    }

    didUpdate = true;
    const persistent = input.persistent ?? toast.persistent;
    return {
      ...toast,
      ...input,
      id: toast.id,
      tone: input.tone ?? toast.tone,
      duration: persistent
        ? 0
        : input.duration ??
          (toast.persistent ? props.defaultDuration : toast.duration),
      dismissible: input.dismissible ?? toast.dismissible,
      persistent,
      dedupeKey: input.dedupeKey ?? toast.dedupeKey
    };
  });

  return didUpdate;
}

function getDedupeKey(input: KToastInput): string | undefined {
  if (input.dedupeKey) {
    return input.dedupeKey;
  }
  if (input.tone === "danger") {
    return `danger:${input.title}:${input.description ?? ""}`;
  }

  return undefined;
}

function resolvePromiseMessage<T>(
  message: KToastPromiseMessage<T>,
  value: T,
  fallbackTone: KToastTone
): KToastInput {
  const resolved = typeof message === "function"
    ? message(value)
    : message;
  if (typeof resolved === "string") {
    return {
      title: resolved,
      tone: fallbackTone
    };
  }

  return {
    ...resolved,
    tone: resolved.tone ?? fallbackTone
  };
}

function normalizeLoadingMessage(
  message: string | KToastInput
): KToastInput {
  return typeof message === "string"
    ? { title: message, tone: "info" }
    : message;
}

async function trackPromise<T, TError = unknown>(
  task: Promise<T>,
  states: KToastPromiseStates<T, TError>
): Promise<T> {
  const loading = normalizeLoadingMessage(states.loading);
  const id = show({
    ...loading,
    persistent: true,
    dedupeKey: states.dedupeKey ?? loading.dedupeKey
  });

  try {
    const result = await task;
    const success = resolvePromiseMessage(states.success, result, "success");
    update(id, {
      ...success,
      persistent: success.persistent ?? false,
      duration: success.duration ?? props.defaultDuration
    });
    return result;
  } catch (error) {
    const failure = resolvePromiseMessage(
      states.error,
      error as TError,
      "danger"
    );
    update(id, {
      ...failure,
      persistent: failure.persistent ?? false,
      duration: failure.duration ?? props.defaultDuration,
      dedupeKey: states.dedupeKey ?? failure.dedupeKey
    });
    throw error;
  }
}

function showTone(
  tone: KToastTone,
  title: string,
  options: KToastOptions = {}
): string {
  return show({
    ...options,
    title,
    tone
  });
}

function handleAction(toast: KToastRecord): void {
  toast.onAction?.();
  dismiss(toast.id);
}

const api: KToastApi = {
  show,
  info: (title, options) => showTone("info", title, options),
  success: (title, options) => showTone("success", title, options),
  warning: (title, options) => showTone("warning", title, options),
  danger: (title, options) => showTone("danger", title, options),
  update,
  promise: trackPromise,
  dismiss,
  clear
};

provide(kToastKey, api);
defineExpose(api);
</script>

<template>
  <slot />

  <Teleport :to="teleportTo">
    <div
      class="k-toast-viewport"
      :class="`k-toast-viewport--${position}`"
      aria-label="通知"
    >
      <TransitionGroup name="k-toast-list">
        <KToast
          v-for="toast in toasts"
          :id="toast.id"
          :key="toast.id"
          :title="toast.title"
          :description="toast.description"
          :tone="toast.tone"
          :duration="toast.duration"
          :dismissible="toast.dismissible"
          :action-label="toast.actionLabel"
          :persistent="toast.persistent"
          :progress="toast.progress"
          :progress-label="toast.progressLabel"
          @dismiss="dismiss"
          @action="handleAction(toast)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.k-toast-viewport {
  position: fixed;
  right: 1rem;
  z-index: var(--k-z-toast, 1200);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  pointer-events: none;
}

.k-toast-viewport--top-right {
  top: 1rem;
}

.k-toast-viewport--bottom-right {
  bottom: 1rem;
  flex-direction: column-reverse;
}

.k-toast-viewport :deep(.k-toast) {
  pointer-events: auto;
}

.k-toast-list-enter-active,
.k-toast-list-leave-active,
.k-toast-list-move {
  transition:
    opacity 180ms ease-out,
    transform 280ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-toast-list-enter-from,
.k-toast-list-leave-to {
  opacity: 0;
  transform: translateY(-0.7rem) scale(0.975);
}

.k-toast-viewport--bottom-right .k-toast-list-enter-from,
.k-toast-viewport--bottom-right .k-toast-list-leave-to {
  transform: translateY(0.7rem) scale(0.975);
}

.k-toast-list-leave-active {
  position: absolute;
  right: 0;
}

@media (max-width: 40rem) {
  .k-toast-viewport {
    right: 0.75rem;
    left: 0.75rem;
  }

  .k-toast-viewport--top-right {
    top: 0.75rem;
  }

  .k-toast-viewport--bottom-right {
    bottom: 0.75rem;
  }

  .k-toast-viewport :deep(.k-toast) {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-toast-list-enter-active,
  .k-toast-list-leave-active,
  .k-toast-list-move {
    transition: opacity 120ms ease-out;
  }

  .k-toast-list-enter-from,
  .k-toast-list-leave-to,
  .k-toast-viewport--bottom-right .k-toast-list-enter-from,
  .k-toast-viewport--bottom-right .k-toast-list-leave-to {
    transform: none;
  }
}
</style>
