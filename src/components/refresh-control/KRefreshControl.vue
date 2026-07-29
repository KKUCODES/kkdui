<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  watch
} from "vue";
import KButton from "../button/KButton.vue";
import type {
  KRefreshControlProps,
  KRefreshSource
} from "./types";

const props = withDefaults(defineProps<KRefreshControlProps>(), {
  modelValue: null,
  paused: false,
  options: () => [5, 10, 30],
  refreshing: false,
  disabled: false,
  lastUpdated: null
});

const emit = defineEmits<{
  "update:modelValue": [seconds: number | null];
  "update:paused": [paused: boolean];
  refresh: [source: KRefreshSource];
}>();

let timer: ReturnType<typeof setInterval> | undefined;

const normalizedOptions = computed(() =>
  [...new Set(props.options)]
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.trunc(value))
    .sort((left, right) => left - right)
);

const lastUpdatedText = computed(() => {
  if (props.lastUpdated === null) {
    return "尚未更新";
  }
  const date =
    props.lastUpdated instanceof Date
      ? props.lastUpdated
      : new Date(props.lastUpdated);
  if (Number.isNaN(date.getTime())) {
    return "更新时间未知";
  }
  return `最后更新 ${new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date)}`;
});

watch(
  () => [props.modelValue, props.paused, props.disabled] as const,
  restartTimer,
  { immediate: true }
);

onBeforeUnmount(clearTimer);

function restartTimer(): void {
  clearTimer();
  if (
    props.modelValue === null ||
    props.paused ||
    props.disabled ||
    props.refreshing
  ) {
    return;
  }
  timer = setInterval(() => {
    if (!props.refreshing) {
      emit("refresh", "auto");
    }
  }, props.modelValue * 1000);
}

function clearTimer(): void {
  if (timer !== undefined) {
    clearInterval(timer);
    timer = undefined;
  }
}

function updateInterval(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  emit("update:modelValue", value === "" ? null : Number(value));
}

function togglePaused(): void {
  emit("update:paused", !props.paused);
}
</script>

<template>
  <div class="k-refresh-control" :aria-busy="refreshing || undefined">
    <KButton
      size="small"
      variant="secondary"
      :loading="refreshing"
      :disabled="disabled"
      @click="emit('refresh', 'manual')"
    >
      <template #leading>
        <svg class="k-refresh-control__icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M13 5.5A5.5 5.5 0 1 0 13.2 10M13 2.5v3h-3" />
        </svg>
      </template>
      刷新
    </KButton>

    <label class="k-refresh-control__interval">
      <span class="k-refresh-control__sr-only">自动刷新间隔</span>
      <select
        :value="modelValue ?? ''"
        :disabled="disabled"
        @change="updateInterval"
      >
        <option value="">关闭自动刷新</option>
        <option
          v-for="seconds in normalizedOptions"
          :key="seconds"
          :value="seconds"
        >
          每 {{ seconds }} 秒
        </option>
      </select>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </label>

    <KButton
      v-if="modelValue !== null"
      size="small"
      variant="ghost"
      :disabled="disabled"
      @click="togglePaused"
    >
      {{ paused ? "继续" : "暂停" }}
    </KButton>

    <span class="k-refresh-control__updated" role="status">
      <span
        v-if="modelValue !== null"
        class="k-refresh-control__dot"
        :class="{ 'is-paused': paused }"
        aria-hidden="true"
      ></span>
      {{ lastUpdatedText }}
    </span>
  </div>
</template>

<style scoped>
.k-refresh-control {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--k-color-text-muted, #65706d);
}

.k-refresh-control__icon {
  width: 0.85rem;
  height: 0.85rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.k-refresh-control__interval {
  position: relative;
  height: 2rem;
}

.k-refresh-control__interval select {
  height: 100%;
  appearance: none;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.28));
  border-radius: 0.68rem;
  padding: 0 2rem 0 0.72rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  font: inherit;
  font-size: 0.68rem;
  cursor: pointer;
}

.k-refresh-control__interval select:focus-visible {
  border-color: var(--k-color-primary, #257360);
  outline: 0;
  box-shadow: 0 0 0 0.2rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12));
}

.k-refresh-control__interval > svg {
  position: absolute;
  top: 50%;
  right: 0.65rem;
  width: 0.72rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  pointer-events: none;
  transform: translateY(-50%);
}

.k-refresh-control__updated {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: 0.25rem;
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.k-refresh-control__dot {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--k-color-primary, #257360);
}

.k-refresh-control__dot.is-paused {
  background: var(--k-color-text-subtle, #929d99);
}

.k-refresh-control__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 40rem) {
  .k-refresh-control {
    flex-wrap: wrap;
  }

  .k-refresh-control__interval {
    height: 2.75rem;
  }

  .k-refresh-control__updated {
    width: 100%;
    margin-left: 0;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-refresh-control__interval select {
    background: var(--k-color-surface, #ffffff);
  }
}
</style>
