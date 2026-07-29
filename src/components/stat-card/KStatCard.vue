<script setup lang="ts">
import { computed } from "vue";
import type { KStatCardProps } from "./types";

const props = withDefaults(defineProps<KStatCardProps>(), {
  value: null,
  unit: "",
  change: null,
  changeLabel: "",
  tone: "neutral",
  loading: false,
  error: ""
});

const changeTone = computed(() => {
  if (props.change === null || props.change === 0) {
    return "neutral";
  }
  return props.change > 0 ? "positive" : "negative";
});

const changeText = computed(() => {
  if (props.change === null) {
    return "";
  }
  const sign = props.change > 0 ? "+" : "";
  return `${sign}${props.change}%`;
});
</script>

<template>
  <article
    class="k-stat-card"
    :class="`k-stat-card--${tone}`"
    :aria-busy="loading || undefined"
  >
    <header class="k-stat-card__header">
      <span>{{ label }}</span>
      <slot name="icon" />
    </header>

    <div v-if="loading" class="k-stat-card__loading" aria-hidden="true">
      <span></span>
      <span></span>
    </div>

    <div v-else-if="error" class="k-stat-card__error" role="alert">
      <span>{{ error }}</span>
      <slot name="error-action" />
    </div>

    <template v-else>
      <div class="k-stat-card__value">
        <slot name="value" :value="value">
          <strong>{{ value ?? "—" }}</strong>
          <span v-if="unit">{{ unit }}</span>
        </slot>
      </div>
      <footer v-if="change !== null || changeLabel || $slots.footer">
        <slot name="footer">
          <span
            v-if="change !== null"
            class="k-stat-card__change"
            :class="`is-${changeTone}`"
          >
            {{ changeText }}
          </span>
          <span v-if="changeLabel">{{ changeLabel }}</span>
        </slot>
      </footer>
    </template>
  </article>
</template>

<style scoped>
.k-stat-card {
  min-width: 0;
  display: grid;
  gap: 0.8rem;
  border: 1px solid rgba(114, 131, 126, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(255, 255, 255, 0.68);
  box-shadow:
    0 1rem 2.5rem -2rem rgba(35, 57, 51, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.k-stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.72rem;
  font-weight: 620;
}

.k-stat-card__value {
  min-height: 2rem;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.k-stat-card__value strong {
  overflow: hidden;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  font-weight: 680;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.035em;
  line-height: 1.05;
  text-overflow: ellipsis;
}

.k-stat-card__value span {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.7rem;
}

.k-stat-card footer {
  min-height: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.65rem;
}

.k-stat-card__change {
  font-weight: 660;
  font-variant-numeric: tabular-nums;
}

.k-stat-card__change.is-positive {
  color: var(--k-color-primary, #257360);
}

.k-stat-card__change.is-negative,
.k-stat-card--danger .k-stat-card__value {
  color: var(--k-color-danger, #b34a4a);
}

.k-stat-card--success .k-stat-card__value {
  color: var(--k-color-primary, #257360);
}

.k-stat-card--warning .k-stat-card__value {
  color: #9a6a20;
}

.k-stat-card__loading {
  display: grid;
  gap: 0.55rem;
}

.k-stat-card__loading span {
  position: relative;
  height: 1.6rem;
  overflow: hidden;
  border-radius: 0.45rem;
  background: rgba(108, 128, 122, 0.1);
}

.k-stat-card__loading span:last-child {
  width: 45%;
  height: 0.65rem;
}

.k-stat-card__loading span::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  content: "";
  animation: k-stat-card-shimmer 1.4s ease-in-out infinite;
  transform: translateX(-100%);
}

.k-stat-card__error {
  min-height: 3.45rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--k-color-danger, #b34a4a);
  font-size: 0.72rem;
}

@keyframes k-stat-card-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-stat-card__loading span::after {
    animation: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-stat-card {
    background: var(--k-color-surface, #ffffff);
  }
}

@media (prefers-contrast: more) {
  .k-stat-card {
    border-color: currentColor;
  }
}
</style>
