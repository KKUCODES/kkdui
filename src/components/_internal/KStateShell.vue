<script setup lang="ts">
import {
  computed,
  type CSSProperties
} from "vue";

const props = withDefaults(defineProps<{
  title: string;
  description?: string;
  tone?: "neutral" | "danger";
  role?: "status" | "alert";
  minHeight?: string | number;
}>(), {
  description: "",
  tone: "neutral",
  role: "status",
  minHeight: "20rem"
});

const rootStyle = computed<CSSProperties>(() => ({
  minHeight:
    typeof props.minHeight === "number"
      ? `${props.minHeight}px`
      : props.minHeight
}));
</script>

<template>
  <section
    class="k-state-shell"
    :class="`k-state-shell--${tone}`"
    :style="rootStyle"
    :role="role"
    :aria-live="role === 'alert' ? 'assertive' : 'polite'"
  >
    <div class="k-state-shell__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="k-state-shell__copy">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="k-state-shell__action">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.k-state-shell {
  width: 100%;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.85rem;
  padding: 2.5rem 1.5rem;
  color: var(--k-color-text-muted, #65706d);
  text-align: center;
}

.k-state-shell__icon {
  width: 3.2rem;
  height: 3.2rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  color: var(--k-color-primary, #257360);
  background: rgba(37, 115, 96, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.k-state-shell--danger .k-state-shell__icon {
  color: var(--k-color-danger, #b34a4a);
  background: rgba(179, 74, 74, 0.09);
}

.k-state-shell__icon :deep(svg) {
  width: 1.45rem;
  height: 1.45rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.k-state-shell__copy {
  max-width: 34rem;
  display: grid;
  gap: 0.38rem;
}

.k-state-shell__copy h2 {
  margin: 0;
  color: var(--k-color-text, #1d2725);
  font-size: 0.98rem;
  font-weight: 670;
  letter-spacing: -0.008em;
  line-height: 1.3;
}

.k-state-shell__copy p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.6;
}

.k-state-shell__action {
  margin-top: 0.2rem;
}

@media (prefers-contrast: more) {
  .k-state-shell__icon {
    outline: 1px solid currentColor;
  }
}
</style>
