<script setup lang="ts">
import {
  computed,
  type CSSProperties
} from "vue";
import KCopyButton from "../copy-button/KCopyButton.vue";
import type {
  KDescriptionItem,
  KDescriptionsColumns,
  KDescriptionsProps
} from "./types";

const props = withDefaults(defineProps<KDescriptionsProps>(), {
  columns: 3,
  bordered: false,
  emptyValue: "—",
  ariaLabel: "详情"
});

const emit = defineEmits<{
  copy: [item: KDescriptionItem, value: string];
  copyError: [item: KDescriptionItem, error: unknown];
}>();

const responsiveColumns = computed<Required<KDescriptionsColumns>>(() => {
  if (typeof props.columns === "number") {
    return {
      mobile: 1,
      tablet: Math.min(2, Math.max(1, props.columns)),
      desktop: Math.max(1, props.columns)
    };
  }
  return {
    mobile: Math.max(1, props.columns.mobile ?? 1),
    tablet: Math.max(1, props.columns.tablet ?? 2),
    desktop: Math.max(1, props.columns.desktop ?? 3)
  };
});

const gridStyle = computed<CSSProperties>(() => ({
  "--k-descriptions-mobile": responsiveColumns.value.mobile,
  "--k-descriptions-tablet": responsiveColumns.value.tablet,
  "--k-descriptions-desktop": responsiveColumns.value.desktop
} as CSSProperties));

function displayValue(item: KDescriptionItem): string | number {
  return item.value === null ||
    item.value === undefined ||
    item.value === ""
    ? props.emptyValue
    : item.value;
}

function copyValue(item: KDescriptionItem): string {
  return typeof item.copyable === "string"
    ? item.copyable
    : String(item.value ?? "");
}
</script>

<template>
  <dl
    class="k-descriptions"
    :class="{ 'k-descriptions--bordered': bordered }"
    :style="gridStyle"
    :aria-label="ariaLabel"
  >
    <div
      v-for="item in items"
      :key="item.key"
      class="k-descriptions__item"
      :class="{ 'is-wide': (item.span ?? 1) > 1 }"
      :style="{
        '--k-description-span': Math.max(1, item.span ?? 1)
      }"
    >
      <dt class="k-descriptions__label">
        <slot :name="`label-${String(item.key)}`" :item="item">
          {{ item.label }}
        </slot>
      </dt>
      <dd class="k-descriptions__value">
        <span class="k-descriptions__value-content">
          <slot
            v-if="item.status"
            :name="`status-${String(item.key)}`"
            :item="item"
            :status="item.status"
          >
            <slot name="status" :item="item" :status="item.status">
              {{ displayValue(item) }}
            </slot>
          </slot>
          <slot
            v-else
            :name="`item-${String(item.key)}`"
            :item="item"
            :value="item.value"
          >
            {{ displayValue(item) }}
          </slot>
        </span>
        <KCopyButton
          v-if="item.copyable && item.value !== null && item.value !== undefined"
          class="k-descriptions__copy"
          :value="copyValue(item)"
          icon-only
          @success="emit('copy', item, $event)"
          @error="emit('copyError', item, $event)"
        />
      </dd>
    </div>
    <div v-if="items.length === 0" class="k-descriptions__empty">
      {{ emptyValue }}
    </div>
  </dl>
</template>

<style scoped>
.k-descriptions {
  display: grid;
  grid-template-columns: repeat(var(--k-descriptions-desktop), minmax(0, 1fr));
  gap: 0;
  margin: 0;
}

.k-descriptions__item {
  min-width: 0;
  grid-column: span var(--k-description-span);
  padding: 0.65rem 0.8rem;
}

.k-descriptions__label {
  margin: 0 0 0.22rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.67rem;
  font-weight: 570;
  line-height: 1.4;
}

.k-descriptions__value {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.28rem;
  margin: 0;
  color: var(--k-color-text, #1d2725);
  font-size: 0.77rem;
  font-weight: 540;
  line-height: 1.5;
}

.k-descriptions__value-content {
  min-width: 0;
  overflow-wrap: anywhere;
}

.k-descriptions__copy {
  flex: 0 0 auto;
  margin: -0.3rem 0;
}

.k-descriptions--bordered {
  overflow: hidden;
  border: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.18));
  border-radius: 0.78rem;
  background: var(--k-color-surface, rgba(255, 255, 255, 0.6));
}

.k-descriptions--bordered .k-descriptions__item {
  border-right: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.13));
  border-bottom: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.13));
}

.k-descriptions__empty {
  grid-column: 1 / -1;
  padding: 1.5rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.75rem;
  text-align: center;
}

@media (max-width: 64rem) {
  .k-descriptions {
    grid-template-columns: repeat(var(--k-descriptions-tablet), minmax(0, 1fr));
  }

  .k-descriptions__item.is-wide {
    grid-column: 1 / -1;
  }
}

@media (max-width: 40rem) {
  .k-descriptions {
    grid-template-columns: repeat(var(--k-descriptions-mobile), minmax(0, 1fr));
  }

  .k-descriptions__item {
    grid-column: span 1;
    padding: 0.62rem 0.65rem;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-descriptions--bordered {
    background: var(--k-color-surface, #fff);
  }
}

@media (prefers-contrast: more) {
  .k-descriptions--bordered,
  .k-descriptions--bordered .k-descriptions__item {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
