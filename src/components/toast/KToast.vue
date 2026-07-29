<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import {
  CloseIcon,
  ErrorIcon,
  InfoIcon,
  SuccessIcon,
  WarningIcon
} from "../../icons";
import type { KToastProps } from "./types";

const props = withDefaults(defineProps<KToastProps>(), {
  description: "",
  tone: "info",
  duration: 4500,
  dismissible: true,
  actionLabel: "",
  persistent: false,
  progress: undefined,
  progressLabel: ""
});

const emit = defineEmits<{
  dismiss: [id: string];
  action: [id: string];
}>();

const rootElement = ref<HTMLElement | null>(null);
let timerId: ReturnType<typeof setTimeout> | undefined;
let remainingDuration = props.duration;
let timerStartedAt = 0;
let isMounted = false;
const normalizedProgress = computed(() =>
  props.progress === undefined
    ? undefined
    : Math.min(1, Math.max(0, props.progress))
);
const progressPercentage = computed(() =>
  Math.round((normalizedProgress.value ?? 0) * 100)
);

function clearTimer(): void {
  if (timerId !== undefined) {
    clearTimeout(timerId);
    timerId = undefined;
  }
}

function startTimer(): void {
  clearTimer();
  if (props.persistent || remainingDuration <= 0) {
    return;
  }

  timerStartedAt = Date.now();
  timerId = setTimeout(() => {
    emit("dismiss", props.id);
  }, remainingDuration);
}

function resetTimer(): void {
  remainingDuration = props.duration;
  if (isMounted) {
    startTimer();
  }
}

function pauseTimer(): void {
  if (timerId === undefined) {
    return;
  }

  remainingDuration = Math.max(
    0,
    remainingDuration - (Date.now() - timerStartedAt)
  );
  clearTimer();
}

function resumeTimer(event?: FocusEvent): void {
  if (
    event?.relatedTarget instanceof Node &&
    rootElement.value?.contains(event.relatedTarget)
  ) {
    return;
  }

  startTimer();
}

watch(
  () => [
    props.duration,
    props.persistent,
    props.title,
    props.description,
    props.tone
  ],
  resetTimer
);

onMounted(() => {
  isMounted = true;
  resetTimer();
});
onBeforeUnmount(() => {
  isMounted = false;
  clearTimer();
});
</script>

<template>
  <article
    ref="rootElement"
    class="k-toast"
    :class="`k-toast--${tone}`"
    :role="tone === 'danger' ? 'alert' : 'status'"
    :aria-live="tone === 'danger' ? 'assertive' : 'polite'"
    aria-atomic="true"
    :data-persistent="persistent || undefined"
    @mouseenter="pauseTimer"
    @mouseleave="resumeTimer"
    @focusin="pauseTimer"
    @focusout="resumeTimer"
  >
    <span class="k-toast__icon" aria-hidden="true">
      <SuccessIcon v-if="tone === 'success'" />
      <WarningIcon v-else-if="tone === 'warning'" />
      <ErrorIcon v-else-if="tone === 'danger'" />
      <InfoIcon v-else />
    </span>

    <div class="k-toast__copy">
      <strong>{{ title }}</strong>
      <span v-if="description">{{ description }}</span>
    </div>

    <button
      v-if="actionLabel"
      class="k-toast__action"
      type="button"
      @click="emit('action', id)"
    >
      {{ actionLabel }}
    </button>

    <button
      v-if="dismissible"
      class="k-toast__dismiss"
      type="button"
      aria-label="关闭通知"
      @click="emit('dismiss', id)"
    >
      <CloseIcon />
    </button>

    <div
      v-if="normalizedProgress !== undefined"
      class="k-toast__progress"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="progressPercentage"
      :aria-valuetext="progressLabel || `${progressPercentage}%`"
    >
      <span :style="{ width: `${progressPercentage}%` }"></span>
    </div>
  </article>
</template>

<style scoped>
.k-toast {
  --k-toast-tone: #376f8b;
  --k-toast-tone-soft: rgba(55, 111, 139, 0.1);

  width: min(24rem, calc(100vw - 1.5rem));
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 1rem;
  padding: 0.75rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(250, 252, 251, 0.92);
  -webkit-backdrop-filter: blur(1.4rem) saturate(155%);
  backdrop-filter: blur(1.4rem) saturate(155%);
  box-shadow:
    0 1.2rem 3rem -1.4rem rgba(25, 48, 41, 0.46),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.k-toast--success {
  --k-toast-tone: #28745c;
  --k-toast-tone-soft: rgba(40, 116, 92, 0.1);
}

.k-toast--warning {
  --k-toast-tone: #8b681f;
  --k-toast-tone-soft: rgba(194, 146, 45, 0.12);
}

.k-toast--danger {
  --k-toast-tone: var(--k-color-danger, #b34a4a);
  --k-toast-tone-soft: rgba(179, 74, 74, 0.1);
}

.k-toast__icon {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 0.68rem;
  color: var(--k-toast-tone);
  background: var(--k-toast-tone-soft);
}

.k-toast__icon svg {
  width: 1.08rem;
  height: 1.08rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.55;
}

.k-toast__copy {
  min-width: 0;
  display: grid;
  gap: 0.16rem;
}

.k-toast__copy strong {
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 660;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-toast__copy span {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.69rem;
  line-height: 1.45;
}

.k-toast__action,
.k-toast__dismiss {
  border: 0;
  color: var(--k-toast-tone);
  background: transparent;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}

.k-toast__action {
  min-height: 2rem;
  border-radius: 0.55rem;
  padding: 0 0.55rem;
  font-size: 0.7rem;
  font-weight: 650;
}

.k-toast__dismiss {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
}

.k-toast__action:hover,
.k-toast__dismiss:hover {
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-toast__action:active,
.k-toast__dismiss:active {
  transform: scale(0.93);
}

.k-toast__action:focus-visible,
.k-toast__dismiss:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.08rem;
}

.k-toast__dismiss svg {
  width: 0.72rem;
  height: 0.72rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.k-toast__progress {
  height: 0.22rem;
  overflow: hidden;
  grid-column: 1 / -1;
  border-radius: 999px;
  background: rgba(105, 123, 117, 0.12);
}

.k-toast__progress span {
  height: 100%;
  display: block;
  border-radius: inherit;
  background: var(--k-toast-tone);
  transition: width 260ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

@media (max-width: 40rem) {
  .k-toast {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .k-toast__action {
    grid-column: 2;
    justify-self: start;
  }

  .k-toast__dismiss {
    width: 2.75rem;
    height: 2.75rem;
    grid-column: 3;
    grid-row: 1 / span 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-toast__action:active,
  .k-toast__dismiss:active {
    transform: none;
  }

  .k-toast__progress span {
    transition: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-toast {
    background: var(--k-color-surface, #ffffff);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-toast {
    border-color: currentColor;
  }
}
</style>
