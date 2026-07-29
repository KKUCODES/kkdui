<script setup lang="ts">
import {
  computed,
  useId
} from "vue";
import type { KFormSectionProps } from "./types";

const props = withDefaults(defineProps<KFormSectionProps>(), {
  description: "",
  collapsible: false,
  disabled: false,
  headingLevel: 3
});

const emit = defineEmits<{
  toggle: [collapsed: boolean];
}>();

const collapsed = defineModel<boolean>("collapsed", { default: false });
const generatedId = useId();
const headingId = `k-form-section-heading-${generatedId}`;
const panelId = `k-form-section-panel-${generatedId}`;
const headingTag = computed(() => `h${props.headingLevel}`);
const isCollapsed = computed(() => props.collapsible && collapsed.value);

function toggle(): void {
  if (!props.collapsible || props.disabled) {
    return;
  }
  collapsed.value = !collapsed.value;
  emit("toggle", collapsed.value);
}
</script>

<template>
  <section
    class="k-form-section"
    :class="{
      'is-collapsible': collapsible,
      'is-collapsed': isCollapsed,
      'is-disabled': disabled
    }"
    :aria-labelledby="headingId"
  >
    <header class="k-form-section__header">
      <component :is="headingTag" :id="headingId" class="k-form-section__heading">
        <button
          v-if="collapsible"
          class="k-form-section__toggle"
          type="button"
          :disabled="disabled"
          :aria-expanded="!isCollapsed"
          :aria-controls="panelId"
          @click="toggle"
        >
          <span class="k-form-section__heading-copy">
            <span class="k-form-section__title">
              <slot name="title">{{ title }}</slot>
            </span>
            <span
              v-if="description || $slots.description"
              class="k-form-section__description"
            >
              <slot name="description">{{ description }}</slot>
            </span>
          </span>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            :class="{ 'is-collapsed': isCollapsed }"
          >
            <path d="m3.5 6 4.5 4 4.5-4" />
          </svg>
        </button>
        <span v-else class="k-form-section__heading-copy">
          <span class="k-form-section__title">
            <slot name="title">{{ title }}</slot>
          </span>
          <span
            v-if="description || $slots.description"
            class="k-form-section__description"
          >
            <slot name="description">{{ description }}</slot>
          </span>
        </span>
      </component>

      <div
        v-if="$slots.actions"
        class="k-form-section__actions"
        @click.stop
      >
        <slot name="actions" :collapsed="isCollapsed" :toggle="toggle"></slot>
      </div>
    </header>

    <div
      v-show="!isCollapsed"
      :id="panelId"
      class="k-form-section__content"
      role="region"
      :aria-labelledby="headingId"
    >
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
.k-form-section {
  min-width: 0;
  border: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.15));
  border-radius: 0.9rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface, rgba(255, 255, 255, 0.6));
  box-shadow: 0 0.65rem 1.6rem -1.45rem rgba(25, 48, 41, 0.35);
}

.k-form-section__header {
  min-height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.72rem 0.9rem;
}

.k-form-section__heading {
  min-width: 0;
  flex: 1;
  margin: 0;
}

.k-form-section__heading-copy {
  min-width: 0;
  display: grid;
  gap: 0.14rem;
}

.k-form-section__title {
  font-size: 0.84rem;
  font-weight: 680;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.k-form-section__description {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.68rem;
  font-weight: 450;
  line-height: 1.48;
}

.k-form-section__toggle {
  width: 100%;
  min-height: 2.35rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 0;
  border-radius: 0.62rem;
  padding: 0.22rem;
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.k-form-section__toggle svg {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--k-color-text-muted, #65706d);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  transition: transform 190ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-form-section__toggle svg.is-collapsed {
  transform: rotate(-90deg);
}

.k-form-section__toggle:hover:not(:disabled) {
  color: var(--k-color-primary, #257360);
}

.k-form-section__toggle:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.08rem;
}

.k-form-section__actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 0.42rem;
}

.k-form-section__content {
  border-top: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.12));
  padding: 0.9rem;
}

.k-form-section.is-disabled {
  opacity: 0.58;
}

@media (max-width: 40rem) {
  .k-form-section__header {
    min-height: 3.9rem;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 0.72rem;
  }

  .k-form-section__toggle {
    min-height: 2.75rem;
  }

  .k-form-section__actions {
    width: 100%;
    justify-content: flex-end;
  }

  .k-form-section__content {
    padding: 0.72rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-form-section__toggle svg {
    transition: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-form-section {
    background: var(--k-color-surface, #fff);
  }
}

@media (prefers-contrast: more) {
  .k-form-section,
  .k-form-section__content {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
