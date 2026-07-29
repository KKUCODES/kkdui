<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { KBadgeProps } from "./types";

const props = withDefaults(defineProps<KBadgeProps>(), {
  tone: "neutral",
  size: "medium",
  dot: true,
  live: false,
  status: undefined,
  wrap: false,
  maxWidth: undefined
});

const resolvedTone = computed(() => {
  if (props.status === "online") return "success";
  if (props.status === "connecting") return "info";
  if (props.status === "offline") return "neutral";
  return props.tone;
});
const resolvedDot = computed(() => props.status !== undefined || props.dot);
const rootStyle = computed<CSSProperties>(() => ({
  maxWidth:
    typeof props.maxWidth === "number"
      ? `${props.maxWidth}px`
      : props.maxWidth
}));
</script>

<template>
  <span
    class="k-badge"
    :class="[
      `k-badge--${resolvedTone}`,
      `k-badge--${size}`,
      status ? `k-badge--status-${status}` : undefined,
      { 'k-badge--wrap': wrap }
    ]"
    :style="rootStyle"
    :role="live || status ? 'status' : undefined"
    :aria-live="live || status ? 'polite' : undefined"
  >
    <span v-if="$slots.icon" class="k-badge__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span v-if="resolvedDot" class="k-badge__dot" aria-hidden="true"></span>
    <span class="k-badge__content">
      <slot />
    </span>
  </span>
</template>

<style scoped>
.k-badge {
  --k-badge-color: #65706d;
  --k-badge-surface: rgba(105, 123, 117, 0.11);

  min-height: 1.55rem;
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  border: 1px solid rgba(105, 123, 117, 0.18);
  border: 1px solid color-mix(in srgb, var(--k-badge-color) 18%, transparent);
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  color: var(--k-badge-color);
  background: var(--k-badge-surface);
  font-size: 0.67rem;
  font-weight: 630;
  letter-spacing: 0.012em;
  line-height: 1;
  white-space: nowrap;
}

.k-badge--small {
  min-height: 1.3rem;
  padding: 0.16rem 0.45rem;
  font-size: 0.61rem;
}

.k-badge--accent {
  --k-badge-color: var(--k-color-primary, #257360);
  --k-badge-surface: rgba(37, 115, 96, 0.09);
}

.k-badge--info {
  --k-badge-color: #376f8b;
  --k-badge-surface: rgba(55, 111, 139, 0.1);
}

.k-badge--success {
  --k-badge-color: #28745c;
  --k-badge-surface: rgba(40, 116, 92, 0.1);
}

.k-badge--warning {
  --k-badge-color: #8b681f;
  --k-badge-surface: rgba(194, 146, 45, 0.12);
}

.k-badge--danger {
  --k-badge-color: var(--k-color-danger, #b34a4a);
  --k-badge-surface: rgba(179, 74, 74, 0.1);
}

.k-badge__dot {
  width: 0.42rem;
  height: 0.42rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 0.16rem color-mix(in srgb, currentColor 12%, transparent);
}

.k-badge__icon {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.k-badge__icon :deep(svg) {
  width: 0.8rem;
  height: 0.8rem;
}

.k-badge__content {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.k-badge--wrap {
  align-items: flex-start;
  border-radius: 0.72rem;
  white-space: normal;
}

.k-badge--wrap .k-badge__content {
  line-height: 1.4;
  white-space: normal;
}

.k-badge--status-connecting .k-badge__dot {
  animation: k-badge-breathe 1.8s ease-in-out infinite;
}

@keyframes k-badge-breathe {
  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-badge--status-connecting .k-badge__dot {
    animation: none;
  }
}

@media (prefers-contrast: more) {
  .k-badge {
    border-color: currentColor;
  }
}
</style>
