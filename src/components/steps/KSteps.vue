<script setup lang="ts">
import { computed } from "vue";
import StepCheckIcon from "../../icons/internal/StepCheckIcon.vue";
import type {
  KStepItem,
  KStepsProps,
  KStepStatus,
  KStepValue
} from "./types";

const props = withDefaults(defineProps<KStepsProps>(), {
  modelValue: null,
  orientation: "horizontal",
  clickable: false,
  ariaLabel: "流程进度"
});

const emit = defineEmits<{
  "update:modelValue": [value: KStepValue];
  select: [item: KStepItem, index: number];
}>();

const activeIndex = computed(() =>
  props.items.findIndex((item) => item.value === props.modelValue)
);

function getStatus(item: KStepItem, index: number): KStepStatus {
  if (item.status) {
    return item.status;
  }
  if (activeIndex.value < 0) {
    return "pending";
  }
  if (index < activeIndex.value) {
    return "complete";
  }
  return index === activeIndex.value ? "current" : "pending";
}

function selectStep(item: KStepItem, index: number): void {
  if (!props.clickable || item.disabled) {
    return;
  }
  emit("update:modelValue", item.value);
  emit("select", item, index);
}
</script>

<template>
  <ol
    class="k-steps"
    :class="`k-steps--${orientation}`"
    :aria-label="ariaLabel"
  >
    <li
      v-for="(item, index) in items"
      :key="`${typeof item.value}-${item.value}`"
      class="k-steps__item"
      :class="[
        `is-${getStatus(item, index)}`,
        { 'is-disabled': item.disabled }
      ]"
      :aria-current="getStatus(item, index) === 'current' ? 'step' : undefined"
    >
      <button
        class="k-steps__control"
        type="button"
        :disabled="!clickable || item.disabled"
        @click="selectStep(item, index)"
      >
        <span class="k-steps__marker" aria-hidden="true">
          <StepCheckIcon
            v-if="getStatus(item, index) === 'complete'"
          />
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span class="k-steps__copy">
          <strong>{{ item.title }}</strong>
          <small v-if="item.description">{{ item.description }}</small>
        </span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.k-steps {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.k-steps__item {
  position: relative;
  min-width: 0;
  flex: 1;
}

.k-steps__item:not(:last-child)::after {
  position: absolute;
  top: 1rem;
  left: calc(50% + 1.35rem);
  width: calc(100% - 2.7rem);
  height: 1px;
  background: var(--k-color-border, rgba(114, 131, 126, 0.28));
  content: "";
}

.k-steps__item.is-complete:not(:last-child)::after {
  background: rgba(37, 115, 96, 0.5);
}

.k-steps__control {
  width: 100%;
  min-width: 0;
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  border: 0;
  border-radius: 0.75rem;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  text-align: center;
}

.k-steps__control:not(:disabled) {
  cursor: pointer;
  touch-action: manipulation;
}

.k-steps__control:not(:disabled):hover {
  color: var(--k-color-text, #1d2725);
}

.k-steps__control:not(:disabled):active .k-steps__marker {
  transform: scale(0.94);
}

.k-steps__control:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.18rem;
}

.k-steps__marker {
  position: relative;
  z-index: 1;
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.28));
  border-radius: 50%;
  color: var(--k-color-text-muted, #65706d);
  background: var(--k-color-surface, #ffffff);
  font-size: 0.68rem;
  font-weight: 680;
  transition: transform 160ms var(--k-ease-spring, ease-out);
}

.k-steps__marker svg {
  width: 0.9rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.k-steps__item.is-current .k-steps__marker,
.k-steps__item.is-complete .k-steps__marker {
  border-color: var(--k-color-primary, #257360);
  color: white;
  background: var(--k-color-primary, #257360);
}

.k-steps__item.is-error .k-steps__marker {
  border-color: var(--k-color-danger, #b34a4a);
  color: white;
  background: var(--k-color-danger, #b34a4a);
}

.k-steps__copy {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}

.k-steps__copy strong {
  color: var(--k-color-text, #1d2725);
  font-size: 0.72rem;
  font-weight: 640;
}

.k-steps__copy small {
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.62rem;
  line-height: 1.45;
}

.k-steps__item.is-disabled {
  opacity: 0.48;
}

.k-steps--vertical {
  display: grid;
}

.k-steps--vertical .k-steps__item {
  min-height: 4rem;
}

.k-steps--vertical .k-steps__item:not(:last-child)::after {
  top: 2.2rem;
  bottom: 0.2rem;
  left: 1rem;
  width: 1px;
  height: auto;
}

.k-steps--vertical .k-steps__control {
  grid-template-columns: 2rem minmax(0, 1fr);
  justify-items: start;
  text-align: left;
}

@media (max-width: 40rem) {
  .k-steps--horizontal {
    display: grid;
  }

  .k-steps--horizontal .k-steps__item {
    min-height: 4rem;
  }

  .k-steps--horizontal .k-steps__item:not(:last-child)::after {
    top: 2.2rem;
    bottom: 0.2rem;
    left: 1rem;
    width: 1px;
    height: auto;
  }

  .k-steps--horizontal .k-steps__control {
    min-height: 2.75rem;
    grid-template-columns: 2rem minmax(0, 1fr);
    justify-items: start;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-steps__marker {
    transition: none;
  }
}
</style>
