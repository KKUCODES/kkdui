<script setup lang="ts">
import {
  computed,
  useId
} from "vue";
import type {
  KDateRangeGranularity,
  KDateRangeGranularityChange,
  KDateRangeGranularityOption,
  KDateRangePickerProps,
  KDateRangeShortcut,
  KDateRangeShortcutKey,
  KDateRangeValue
} from "./types";

const DAY_IN_MILLISECONDS = 86_400_000;

const props = withDefaults(defineProps<KDateRangePickerProps>(), {
  type: "date",
  size: "medium",
  startLabel: "开始时间",
  endLabel: "结束时间",
  min: "",
  max: "",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: true,
  showShortcuts: true,
  shortcuts: () => [
    { key: "today", label: "今天" },
    { key: "yesterday", label: "昨天" },
    { key: "last-7-days", label: "近 7 天" },
    { key: "last-30-days", label: "近 30 天" }
  ],
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Local",
  showTimeZone: true,
  maxSpanDays: 0,
  showGranularity: true,
  granularity: "day",
  granularityOptions: () => [
    { value: "hour", label: "按小时", maxSpanDays: 7 },
    { value: "day", label: "按天", maxSpanDays: 92 },
    { value: "week", label: "按周", minSpanDays: 7, maxSpanDays: 366 },
    { value: "month", label: "按月", minSpanDays: 28 }
  ]
});

const emit = defineEmits<{
  change: [value: KDateRangeValue | null];
  clear: [];
  shortcut: [shortcut: KDateRangeShortcut & { value: KDateRangeValue }];
  "update:granularity": [value: KDateRangeGranularity];
  granularityChange: [change: KDateRangeGranularityChange];
  validationChange: [error: string];
}>();

const model = defineModel<KDateRangeValue | null>({ default: null });
const generatedId = useId();
const startId = computed(() => `${props.id ?? `k-date-range-${generatedId}`}-start`);
const endId = computed(() => `${props.id ?? `k-date-range-${generatedId}`}-end`);
const errorId = computed(() => `${props.id ?? `k-date-range-${generatedId}`}-error`);
const startValue = computed(() => model.value?.start ?? "");
const endValue = computed(() => model.value?.end ?? "");
const rangeSpanDays = computed(() =>
  getRangeSpanDays(startValue.value, endValue.value)
);
const rangeError = computed(() => {
  if (
    startValue.value !== "" &&
    endValue.value !== "" &&
    startValue.value > endValue.value
  ) {
    return "结束时间不能早于开始时间";
  }
  if (
    normalizedMaxSpanDays.value > 0 &&
    rangeSpanDays.value !== null &&
    rangeSpanDays.value > normalizedMaxSpanDays.value
  ) {
    return `单次最多查询 ${normalizedMaxSpanDays.value} 天`;
  }

  return "";
});
const isRangeInvalid = computed(
  () => props.invalid || rangeError.value !== ""
);
const hasValue = computed(
  () => startValue.value !== "" || endValue.value !== ""
);
const normalizedMaxSpanDays = computed(() =>
  Math.max(0, Math.floor(props.maxSpanDays))
);

function updateRange(part: "start" | "end", event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  const nextValue = {
    start: part === "start" ? value : startValue.value,
    end: part === "end" ? value : endValue.value
  };

  model.value = nextValue.start === "" && nextValue.end === ""
    ? null
    : nextValue;
  emit("change", model.value);
  emit("validationChange", getRangeError(nextValue));
  suggestGranularity(nextValue);
}

function clear(): void {
  if (props.disabled || props.readonly || !hasValue.value) {
    return;
  }

  model.value = null;
  emit("change", null);
  emit("clear");
  emit("validationChange", "");
}

function applyShortcut(shortcut: KDateRangeShortcut): void {
  if (props.disabled || props.readonly) {
    return;
  }

  const value = resolveShortcut(shortcut.key, new Date());
  model.value = value;
  emit("change", value);
  emit("shortcut", { ...shortcut, value });
  emit("validationChange", getRangeError(value));
  suggestGranularity(value);
}

function resolveShortcut(
  key: KDateRangeShortcutKey,
  now: Date
): KDateRangeValue {
  const end = new Date(now);
  const start = new Date(now);
  if (key === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (key === "last-7-days") {
    start.setDate(start.getDate() - 6);
  } else if (key === "last-30-days") {
    start.setDate(start.getDate() - 29);
  }

  if (props.type === "datetime-local") {
    start.setHours(0, 0, 0, 0);
    if (key === "yesterday") {
      end.setHours(23, 59, 59, 0);
    }
  }

  return {
    start: clampBoundary(formatDate(start)),
    end: clampBoundary(formatDate(end))
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  if (props.type === "date") {
    return `${year}-${month}-${day}`;
  }

  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function clampBoundary(value: string): string {
  if (props.min && value < props.min) {
    return props.min;
  }
  if (props.max && value > props.max) {
    return props.max;
  }

  return value;
}

function getRangeSpanDays(start: string, end: string): number | null {
  if (start === "" || end === "" || start > end) {
    return null;
  }

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return null;
  }

  return Math.floor((endTime - startTime) / DAY_IN_MILLISECONDS) + 1;
}

function getRangeError(value: KDateRangeValue | null): string {
  if (value === null) {
    return "";
  }
  if (value.start && value.end && value.start > value.end) {
    return "结束时间不能早于开始时间";
  }

  const span = getRangeSpanDays(value.start, value.end);
  if (
    normalizedMaxSpanDays.value > 0 &&
    span !== null &&
    span > normalizedMaxSpanDays.value
  ) {
    return `单次最多查询 ${normalizedMaxSpanDays.value} 天`;
  }

  return "";
}

function isGranularityAvailable(
  option: KDateRangeGranularityOption,
  span = rangeSpanDays.value
): boolean {
  if (span === null) {
    return true;
  }

  return (
    (option.minSpanDays === undefined || span >= option.minSpanDays) &&
    (option.maxSpanDays === undefined || span <= option.maxSpanDays)
  );
}

function suggestGranularity(value: KDateRangeValue | null): void {
  const span = value === null
    ? null
    : getRangeSpanDays(value.start, value.end);
  const selectedOption = props.granularityOptions.find(
    (option) => option.value === props.granularity
  );
  if (selectedOption === undefined || isGranularityAvailable(selectedOption, span)) {
    return;
  }

  const fallback = props.granularityOptions.find((option) =>
    isGranularityAvailable(option, span)
  );
  if (fallback === undefined) {
    return;
  }

  emit("update:granularity", fallback.value);
  emit("granularityChange", {
    value: fallback.value,
    reason: "range"
  });
}

function updateGranularity(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as KDateRangeGranularity;
  emit("update:granularity", value);
  emit("granularityChange", {
    value,
    reason: "user"
  });
}
</script>

<template>
  <div
    class="k-date-range"
    :class="[
      `k-date-range--${size}`,
      {
        'k-date-range--disabled': disabled,
        'k-date-range--readonly': readonly,
        'k-date-range--invalid': isRangeInvalid,
        'k-date-range--clearable': clearable && hasValue
      }
    ]"
    role="group"
    aria-label="日期范围"
  >
    <label class="k-date-range__field" :for="startId">
      <span>{{ startLabel }}</span>
      <input
        :id="startId"
        :name="startName"
        :type="type"
        :value="startValue"
        :min="min || undefined"
        :max="endValue || max || undefined"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="isRangeInvalid"
        :aria-describedby="rangeError ? errorId : undefined"
        @input="updateRange('start', $event)"
      />
    </label>

    <svg
      class="k-date-range__separator"
      viewBox="0 0 20 12"
      aria-hidden="true"
    >
      <path d="M2 6h16m-4-4 4 4-4 4" />
    </svg>

    <label class="k-date-range__field" :for="endId">
      <span>{{ endLabel }}</span>
      <input
        :id="endId"
        :name="endName"
        :type="type"
        :value="endValue"
        :min="startValue || min || undefined"
        :max="max || undefined"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="isRangeInvalid"
        :aria-describedby="rangeError ? errorId : undefined"
        @input="updateRange('end', $event)"
      />
    </label>

    <button
      v-if="clearable && hasValue"
      class="k-date-range__clear"
      type="button"
      :disabled="disabled || readonly"
      aria-label="清除日期范围"
      @click="clear"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m4 4 8 8M12 4l-8 8" />
      </svg>
    </button>

    <div
      v-if="showShortcuts || showTimeZone || showGranularity"
      class="k-date-range__toolbar"
    >
      <div
        v-if="showShortcuts"
        class="k-date-range__shortcuts"
        aria-label="快捷日期范围"
      >
        <button
          v-for="shortcut in shortcuts"
          :key="shortcut.key"
          class="k-date-range__shortcut"
          type="button"
          :disabled="disabled || readonly"
          :aria-label="`选择${shortcut.label}`"
          @click="applyShortcut(shortcut)"
        >
          {{ shortcut.label }}
        </button>
      </div>

      <div class="k-date-range__context">
        <span v-if="showTimeZone" class="k-date-range__timezone">
          时区：{{ timeZone }}
        </span>
        <label
          v-if="showGranularity"
          class="k-date-range__granularity"
        >
          <span>统计粒度</span>
          <select
            :value="granularity"
            :disabled="disabled || readonly"
            @change="updateGranularity"
          >
            <option
              v-for="option in granularityOptions"
              :key="option.value"
              :value="option.value"
              :disabled="!isGranularityAvailable(option)"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <p
      v-if="rangeError"
      :id="errorId"
      class="k-date-range__error"
      role="alert"
    >
      {{ rangeError }}
    </p>
  </div>
</template>

<style scoped>
.k-date-range {
  --k-date-range-height: 3rem;
  --k-date-range-font-size: 0.8rem;

  position: relative;
  width: 100%;
  min-width: 0;
  min-height: var(--k-date-range-height);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.28));
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0.35rem 0.7rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition:
    border-color 170ms ease-out,
    background-color 170ms ease-out,
    box-shadow 200ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-date-range--small {
  --k-date-range-height: 2.45rem;
  --k-date-range-font-size: 0.74rem;
}

.k-date-range--large {
  --k-date-range-height: 3.4rem;
  --k-date-range-font-size: 0.84rem;
}

.k-date-range:hover:not(.k-date-range--disabled) {
  border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.42));
}

.k-date-range:focus-within {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-control-surface-focus, rgba(255, 255, 255, 0.94));
  box-shadow:
    0 0 0 0.22rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k-date-range__field {
  min-width: 0;
  display: grid;
  gap: 0.03rem;
}

.k-date-range__field > span {
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.6rem;
  font-weight: 620;
  letter-spacing: 0.035em;
  line-height: 1.2;
}

.k-date-range__field input {
  width: 100%;
  min-width: 0;
  height: 1.45rem;
  border: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: var(--k-date-range-font-size);
  font-variant-numeric: tabular-nums;
  outline: 0;
}

.k-date-range__field input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.55;
}

.k-date-range__separator {
  width: 1rem;
  height: 0.75rem;
  fill: none;
  stroke: var(--k-color-text-subtle, #929d99);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.4;
}

.k-date-range__clear {
  position: absolute;
  top: 50%;
  right: 0.45rem;
  width: 1.75rem;
  height: 1.75rem;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: var(--k-color-surface, #ffffff);
  box-shadow: 0 0.2rem 0.5rem rgba(39, 62, 56, 0.14);
  cursor: pointer;
  touch-action: manipulation;
  transform: translateY(-50%);
  transition:
    color 140ms ease-out,
    background-color 140ms ease-out,
    transform 100ms ease-out;
}

.k-date-range--clearable {
  padding-right: 2.65rem;
}

.k-date-range__clear:hover:not(:disabled) {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, #edf5f1);
}

.k-date-range__clear:active:not(:disabled) {
  transform: translateY(-50%) scale(0.9);
}

.k-date-range__clear:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.08rem;
}

.k-date-range__clear svg {
  width: 0.72rem;
  height: 0.72rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.k-date-range__toolbar {
  min-width: 0;
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border-top: 1px solid rgba(114, 131, 126, 0.12);
  padding-top: 0.42rem;
}

.k-date-range__shortcuts {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.k-date-range__shortcuts::-webkit-scrollbar {
  display: none;
}

.k-date-range__shortcut {
  min-height: 1.75rem;
  flex: 0 0 auto;
  border: 0;
  border-radius: 0.48rem;
  padding: 0 0.48rem;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-size: 0.67rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 120ms ease-out,
    background-color 120ms ease-out,
    transform 80ms ease-out;
}

.k-date-range__shortcut:hover:not(:disabled) {
  color: var(--k-color-primary, #257360);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-date-range__shortcut:active:not(:disabled) {
  transform: scale(0.96);
}

.k-date-range__shortcut:focus-visible,
.k-date-range__granularity select:focus-visible {
  outline: 0.16rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.08rem;
}

.k-date-range__shortcut:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.k-date-range__context {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.65rem;
}

.k-date-range__timezone {
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.k-date-range__granularity {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.62rem;
  font-weight: 600;
  white-space: nowrap;
}

.k-date-range__granularity select {
  height: 1.75rem;
  border: 1px solid rgba(114, 131, 126, 0.22);
  border-radius: 0.48rem;
  padding: 0 1.55rem 0 0.45rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface, #ffffff);
  font: inherit;
  font-size: 0.67rem;
  font-weight: 600;
}

.k-date-range__error {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--k-color-danger, #b34a4a);
  font-size: 0.66rem;
  font-weight: 560;
  line-height: 1.35;
}

.k-date-range--invalid {
  border-color: var(--k-color-danger, #b34a4a);
}

.k-date-range--invalid:focus-within {
  box-shadow:
    0 0 0 0.22rem var(--k-color-danger-ring, rgba(179, 74, 74, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k-date-range--disabled,
.k-date-range--readonly {
  opacity: 0.58;
}

.k-date-range--disabled {
  cursor: not-allowed;
}

@media (max-width: 36rem) {
  .k-date-range {
    grid-template-columns: 1fr;
    gap: 0.35rem;
    padding-block: 0.55rem;
  }

  .k-date-range__separator {
    display: none;
  }

  .k-date-range__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .k-date-range__context {
    justify-content: space-between;
  }

  .k-date-range__shortcut {
    min-height: 2.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-date-range,
  .k-date-range__clear {
    transition: border-color 100ms ease-out, background-color 100ms ease-out;
  }

  .k-date-range__clear:active:not(:disabled) {
    transform: translateY(-50%);
  }

  .k-date-range__shortcut {
    transition: none;
  }

  .k-date-range__shortcut:active:not(:disabled) {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-date-range {
    background: var(--k-color-surface, #ffffff);
  }
}

@media (prefers-contrast: more) {
  .k-date-range {
    border-color: currentColor;
  }
}
</style>
