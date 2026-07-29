<script setup lang="ts">
import { computed } from "vue";
import type { KProgressProps } from "./types";

const props = withDefaults(defineProps<KProgressProps>(), {
  min: 0,
  max: 100,
  label: "",
  valueLabel: "",
  tone: "primary",
  size: "medium",
  showValue: true,
  indeterminate: false
});

const normalizedMax = computed(() =>
  Number.isFinite(props.max) && props.max > props.min
    ? props.max
    : props.min + 1
);
const normalizedValue = computed(() =>
  Math.min(
    normalizedMax.value,
    Math.max(props.min, Number.isFinite(props.value) ? props.value : props.min)
  )
);
const percent = computed(() =>
  ((normalizedValue.value - props.min) /
    (normalizedMax.value - props.min)) *
  100
);
const displayValue = computed(() =>
  props.valueLabel || `${Math.round(percent.value)}%`
);
</script>

<template>
  <div
    class="k-progress"
    :class="[
      `k-progress--${tone}`,
      `k-progress--${size}`,
      { 'is-indeterminate': indeterminate }
    ]"
  >
    <div v-if="label || showValue" class="k-progress__header">
      <span>{{ label }}</span>
      <span v-if="showValue">{{ displayValue }}</span>
    </div>
    <div
      class="k-progress__track"
      role="progressbar"
      :aria-label="label || '进度'"
      :aria-valuemin="indeterminate ? undefined : min"
      :aria-valuemax="indeterminate ? undefined : normalizedMax"
      :aria-valuenow="indeterminate ? undefined : normalizedValue"
      :aria-valuetext="displayValue"
    >
      <span
        class="k-progress__bar"
        :style="{ width: indeterminate ? undefined : `${percent}%` }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.k-progress {
  display: grid;
  gap: 0.42rem;
  color: var(--k-color-text, #1d2725);
}

.k-progress__header {
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.k-progress__track {
  position: relative;
  height: 0.55rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(108, 128, 122, 0.12);
  box-shadow: inset 0 1px 1px rgba(35, 57, 51, 0.08);
}

.k-progress--small .k-progress__track {
  height: 0.35rem;
}

.k-progress__bar {
  position: absolute;
  inset-block: 0;
  left: 0;
  min-width: 0;
  border-radius: inherit;
  background: var(--k-color-primary, #257360);
  transition: width 260ms var(--k-ease-spring, ease-out);
}

.k-progress--success .k-progress__bar {
  background: #2c8069;
}

.k-progress--warning .k-progress__bar {
  background: #b67a27;
}

.k-progress--danger .k-progress__bar {
  background: var(--k-color-danger, #b34a4a);
}

.k-progress.is-indeterminate .k-progress__bar {
  width: 38%;
  animation: k-progress-indeterminate 1.25s ease-in-out infinite;
}

@keyframes k-progress-indeterminate {
  from {
    transform: translateX(-110%);
  }
  to {
    transform: translateX(290%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-progress__bar {
    transition: none;
  }

  .k-progress.is-indeterminate .k-progress__bar {
    width: 100%;
    animation: none;
    opacity: 0.55;
  }
}
</style>
