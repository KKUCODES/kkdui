<script setup lang="ts">
import {
  computed,
  type CSSProperties
} from "vue";
import type { KLoadingStateProps } from "./types";

const props = withDefaults(defineProps<KLoadingStateProps>(), {
  title: "正在加载",
  description: "数据准备好后会自动显示。",
  rows: 4,
  minHeight: "20rem"
});

const rootStyle = computed<CSSProperties>(() => ({
  minHeight:
    typeof props.minHeight === "number"
      ? `${props.minHeight}px`
      : props.minHeight
}));
const rowCount = computed(() =>
  Math.max(
    1,
    Math.trunc(Number.isFinite(props.rows) ? props.rows : 1)
  )
);

function getRowStyle(rowIndex: number): CSSProperties {
  return {
    width: `${Math.max(72, 100 - (rowIndex - 1) * 4)}%`
  };
}
</script>

<template>
  <section
    class="k-loading-state"
    :style="rootStyle"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="k-loading-state__heading">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>

    <slot>
      <div class="k-loading-state__skeleton" aria-hidden="true">
        <span class="k-loading-state__title-line"></span>
        <span class="k-loading-state__meta-line"></span>
        <div class="k-loading-state__rows">
          <span
            v-for="rowIndex in rowCount"
            :key="rowIndex"
            :style="getRowStyle(rowIndex)"
          ></span>
        </div>
      </div>
    </slot>
  </section>
</template>

<style scoped>
.k-loading-state {
  width: 100%;
  display: grid;
  align-content: center;
  gap: 1.35rem;
  padding: 2rem clamp(1rem, 4vw, 3rem);
}

.k-loading-state__heading {
  display: grid;
  gap: 0.3rem;
}

.k-loading-state__heading strong {
  color: var(--k-color-text, #1d2725);
  font-size: 0.88rem;
  font-weight: 660;
}

.k-loading-state__heading span {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.72rem;
}

.k-loading-state__skeleton {
  width: 100%;
  display: grid;
  gap: 0.65rem;
}

.k-loading-state__title-line,
.k-loading-state__meta-line,
.k-loading-state__rows > span {
  position: relative;
  overflow: hidden;
  display: block;
  border-radius: 999px;
  background: rgba(108, 128, 122, 0.1);
}

.k-loading-state__title-line {
  width: min(15rem, 48%);
  height: 0.85rem;
}

.k-loading-state__meta-line {
  width: min(22rem, 68%);
  height: 0.65rem;
}

.k-loading-state__rows {
  display: grid;
  gap: 0.7rem;
  margin-top: 0.55rem;
}

.k-loading-state__rows > span {
  height: 2.6rem;
  border-radius: 0.7rem;
}

.k-loading-state__title-line::after,
.k-loading-state__meta-line::after,
.k-loading-state__rows > span::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.75),
    transparent
  );
  content: "";
  transform: translateX(-100%);
  animation: k-loading-shimmer 1.5s var(--k-ease-spring, ease-out) infinite;
}

@keyframes k-loading-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-loading-state__title-line::after,
  .k-loading-state__meta-line::after,
  .k-loading-state__rows > span::after {
    animation: none;
    opacity: 0;
  }
}

@media (prefers-contrast: more) {
  .k-loading-state__title-line,
  .k-loading-state__meta-line,
  .k-loading-state__rows > span {
    outline: 1px solid var(--k-color-text-muted, #65706d);
  }
}
</style>
