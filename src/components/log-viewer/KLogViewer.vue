<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch
} from "vue";
import LogSearchIcon from "../../icons/internal/LogSearchIcon.vue";
import KButton from "../button/KButton.vue";
import KInput from "../input/KInput.vue";
import type {
  KLogEntry,
  KLogLevel,
  KLogViewerProps
} from "./types";

const props = withDefaults(defineProps<KLogViewerProps>(), {
  height: 360,
  rowHeight: 27,
  overscan: 8,
  query: "",
  paused: false,
  autoScroll: true,
  levels: () => [],
  emptyText: "暂无日志"
});

const emit = defineEmits<{
  "update:query": [query: string];
  "update:paused": [paused: boolean];
  copy: [entries: readonly KLogEntry[]];
  copyError: [error: unknown];
}>();

const scroller = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const levelSet = computed(() => new Set<KLogLevel>(props.levels));
const filteredEntries = computed(() => {
  const normalizedQuery = props.query.trim().toLocaleLowerCase();
  return props.entries.filter((entry) => {
    if (levelSet.value.size > 0 && !levelSet.value.has(entry.level)) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return `${entry.message} ${entry.source ?? ""}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
});
const viewportCount = computed(() =>
  Math.ceil(props.height / props.rowHeight)
);
const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - props.overscan)
);
const endIndex = computed(() =>
  Math.min(
    filteredEntries.value.length,
    startIndex.value + viewportCount.value + props.overscan * 2
  )
);
const visibleEntries = computed(() =>
  filteredEntries.value.slice(startIndex.value, endIndex.value)
);
const spacerBefore = computed(() => startIndex.value * props.rowHeight);
const spacerAfter = computed(
  () =>
    Math.max(0, filteredEntries.value.length - endIndex.value) *
    props.rowHeight
);

watch(
  () => props.entries.length,
  async () => {
    if (!props.autoScroll || props.paused) {
      return;
    }
    await nextTick();
    if (scroller.value) {
      scroller.value.scrollTop = scroller.value.scrollHeight;
    }
  }
);

function handleScroll(event: Event): void {
  scrollTop.value = (event.target as HTMLElement).scrollTop;
}

function formatTimestamp(value: KLogEntry["timestamp"]): string {
  if (value === undefined) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false
  }).format(date);
}

function serializeEntry(entry: KLogEntry): string {
  const time = formatTimestamp(entry.timestamp);
  return [
    time && `[${time}]`,
    entry.level.toUpperCase(),
    entry.source && `[${entry.source}]`,
    entry.message
  ]
    .filter(Boolean)
    .join(" ");
}

async function copyVisibleLogs(): Promise<void> {
  try {
    await navigator.clipboard.writeText(
      filteredEntries.value.map(serializeEntry).join("\n")
    );
    emit("copy", filteredEntries.value);
  } catch (error) {
    emit("copyError", error);
  }
}
</script>

<template>
  <section class="k-log-viewer" aria-label="日志查看器">
    <header class="k-log-viewer__toolbar">
      <KInput
        :model-value="query"
        type="search"
        size="small"
        placeholder="搜索日志"
        aria-label="搜索日志"
        @update:model-value="emit('update:query', $event)"
      >
        <template #prefix>
          <LogSearchIcon />
        </template>
      </KInput>
      <KButton
        size="small"
        variant="ghost"
        @click="emit('update:paused', !paused)"
      >
        {{ paused ? "继续滚动" : "暂停滚动" }}
      </KButton>
      <KButton
        size="small"
        variant="ghost"
        :disabled="filteredEntries.length === 0"
        @click="copyVisibleLogs"
      >
        复制
      </KButton>
    </header>

    <div
      ref="scroller"
      class="k-log-viewer__scroller"
      :style="{ height: `${height}px` }"
      tabindex="0"
      @scroll="handleScroll"
    >
      <div
        v-if="filteredEntries.length === 0"
        class="k-log-viewer__empty"
      >
        {{ query ? "没有匹配的日志" : emptyText }}
      </div>
      <template v-else>
        <div :style="{ height: `${spacerBefore}px` }" aria-hidden="true"></div>
        <div
          v-for="entry in visibleEntries"
          :key="entry.id"
          class="k-log-viewer__row"
          :class="`is-${entry.level}`"
          :style="{ height: `${rowHeight}px` }"
        >
          <time v-if="entry.timestamp">{{ formatTimestamp(entry.timestamp) }}</time>
          <span class="k-log-viewer__level">{{ entry.level }}</span>
          <span v-if="entry.source" class="k-log-viewer__source">
            {{ entry.source }}
          </span>
          <span class="k-log-viewer__message">{{ entry.message }}</span>
        </div>
        <div :style="{ height: `${spacerAfter}px` }" aria-hidden="true"></div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.k-log-viewer {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(87, 103, 99, 0.3);
  border-radius: 0.9rem;
  background: #17201f;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.k-log-viewer__toolbar {
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) auto auto;
  align-items: center;
  gap: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.45rem;
  background: rgba(255, 255, 255, 0.035);
}

.k-log-viewer__toolbar :deep(.k-input) {
  --k-color-text: #ecf2ef;
  --k-color-text-muted: #a9b6b1;
  --k-color-text-subtle: #7f8d88;
  --k-color-border: rgba(255, 255, 255, 0.12);
  --k-color-control-surface: rgba(255, 255, 255, 0.05);
  --k-color-control-surface-focus: rgba(255, 255, 255, 0.08);
}

.k-log-viewer__toolbar :deep(.k-button) {
  color: #b8c5c0;
}

.k-log-viewer__toolbar svg {
  width: 0.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.4;
}

.k-log-viewer__scroller {
  overflow: auto;
  color: #c8d3cf;
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  overscroll-behavior: contain;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

.k-log-viewer__scroller:focus-visible {
  outline: 0.18rem solid rgba(89, 177, 151, 0.4);
  outline-offset: -0.18rem;
}

.k-log-viewer__row {
  min-width: max-content;
  display: grid;
  grid-template-columns: 6.8rem 4.2rem auto minmax(18rem, 1fr);
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  line-height: 1;
  white-space: pre;
}

.k-log-viewer__row:hover {
  background: rgba(255, 255, 255, 0.035);
}

.k-log-viewer__row time {
  color: #75847f;
  font-variant-numeric: tabular-nums;
}

.k-log-viewer__level {
  color: #80a9b8;
  font-weight: 700;
  text-transform: uppercase;
}

.k-log-viewer__row.is-debug .k-log-viewer__level {
  color: #8e9995;
}

.k-log-viewer__row.is-success .k-log-viewer__level {
  color: #6cc4a9;
}

.k-log-viewer__row.is-warning .k-log-viewer__level {
  color: #e4ad62;
}

.k-log-viewer__row.is-error .k-log-viewer__level {
  color: #ee8585;
}

.k-log-viewer__source {
  color: #8ca19a;
}

.k-log-viewer__message {
  color: #d7e0dd;
}

.k-log-viewer__empty {
  min-height: 100%;
  display: grid;
  place-items: center;
  color: #75847f;
}

@media (max-width: 40rem) {
  .k-log-viewer__toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .k-log-viewer__toolbar :deep(.k-input) {
    grid-column: 1 / -1;
  }
}
</style>
