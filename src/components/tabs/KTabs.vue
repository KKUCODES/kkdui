<script setup lang="ts">
import {
  computed,
  useId
} from "vue";
import { ChevronDownIcon } from "../../icons";
import KButton from "../button/KButton.vue";
import type {
  KTabItem,
  KTabsProps,
  KTabValue
} from "./types";

const props = withDefaults(defineProps<KTabsProps>(), {
  ariaLabel: "内容分区",
  activation: "automatic",
  stretch: false,
  unmountInactive: false,
  mobileMode: "scroll"
});

const emit = defineEmits<{
  change: [value: KTabValue];
  retry: [item: KTabItem];
}>();

const model = defineModel<KTabValue | null>({ default: null });
const generatedId = useId();
const enabledItems = computed(() =>
  props.items.filter((item) => !item.disabled)
);
const activeValue = computed(() => {
  const controlledItem = props.items.find(
    (item) => item.value === model.value && !item.disabled
  );
  return controlledItem?.value ?? enabledItems.value[0]?.value ?? null;
});

function isActive(item: KTabItem): boolean {
  return item.value === activeValue.value;
}

function activate(item: KTabItem): void {
  if (item.disabled || isActive(item)) {
    return;
  }

  model.value = item.value;
  emit("change", item.value);
}

function getTabId(index: number): string {
  return `k-tabs-${generatedId}-tab-${index}`;
}

function getPanelId(index: number): string {
  return `k-tabs-${generatedId}-panel-${index}`;
}

function handleKeydown(
  event: KeyboardEvent,
  item: KTabItem,
  itemIndex: number
): void {
  if (
    props.activation === "manual" &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    activate(item);
    return;
  }

  const navigationKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!navigationKeys.includes(event.key)) {
    return;
  }

  event.preventDefault();
  const enabledIndexes = props.items
    .map((candidate, index) => candidate.disabled ? -1 : index)
    .filter((index) => index >= 0);
  const currentEnabledIndex = enabledIndexes.indexOf(itemIndex);
  let nextEnabledIndex = currentEnabledIndex;

  if (event.key === "Home") {
    nextEnabledIndex = 0;
  } else if (event.key === "End") {
    nextEnabledIndex = enabledIndexes.length - 1;
  } else {
    const direction = event.key === "ArrowRight" ? 1 : -1;
    nextEnabledIndex =
      (currentEnabledIndex + direction + enabledIndexes.length) %
      enabledIndexes.length;
  }

  const nextItemIndex = enabledIndexes[nextEnabledIndex];
  const nextItem = props.items[nextItemIndex];
  const tabList = (event.currentTarget as HTMLElement).closest(
    '[role="tablist"]'
  );
  const nextTab = tabList?.querySelectorAll<HTMLButtonElement>(
    '[role="tab"]'
  )[nextItemIndex];
  nextTab?.focus();

  if (props.activation === "automatic") {
    activate(nextItem);
  }
}

function handleMobileChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  const item = props.items.find(
    (candidate) => String(candidate.value) === value
  );
  if (item) {
    activate(item);
  }
}
</script>

<template>
  <div class="k-tabs">
    <div
      class="k-tabs__list"
      :class="[
        { 'k-tabs__list--stretch': stretch },
        `k-tabs__list--mobile-${mobileMode}`
      ]"
      role="tablist"
      :aria-label="ariaLabel"
    >
      <button
        v-for="(item, itemIndex) in items"
        :id="getTabId(itemIndex)"
        :key="item.value"
        class="k-tabs__tab"
        :class="{ 'is-active': isActive(item) }"
        type="button"
        role="tab"
        :disabled="item.disabled"
        :tabindex="isActive(item) ? 0 : -1"
        :aria-selected="isActive(item)"
        :aria-controls="getPanelId(itemIndex)"
        @click="activate(item)"
        @keydown="handleKeydown($event, item, itemIndex)"
      >
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge !== undefined"
          class="k-tabs__badge"
          :class="item.badgeTone ? `is-${item.badgeTone}` : undefined"
        >
          {{ item.badge }}
        </span>
      </button>
    </div>

    <label
      v-if="mobileMode === 'select'"
      class="k-tabs__mobile-select"
    >
      <span>当前分区</span>
      <select :value="String(activeValue ?? '')" @change="handleMobileChange">
        <option
          v-for="item in items"
          :key="item.value"
          :value="String(item.value)"
          :disabled="item.disabled"
        >
          {{ item.label }}{{ item.badge !== undefined ? ` (${item.badge})` : "" }}
        </option>
      </select>
      <ChevronDownIcon />
    </label>

    <div class="k-tabs__panels">
      <template
        v-for="(item, itemIndex) in items"
        :key="`panel-${item.value}`"
      >
        <section
          v-if="!unmountInactive || isActive(item)"
          v-show="isActive(item)"
          :id="getPanelId(itemIndex)"
          class="k-tabs__panel"
          role="tabpanel"
          :aria-labelledby="getTabId(itemIndex)"
          :aria-busy="item.loading || undefined"
          :tabindex="isActive(item) ? 0 : -1"
        >
          <div v-if="item.loading" class="k-tabs__state" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div v-else-if="item.error" class="k-tabs__error" role="alert">
            <strong>内容加载失败</strong>
            <span>{{ item.error }}</span>
            <KButton
              size="small"
              variant="secondary"
              @click="emit('retry', item)"
            >
              重试
            </KButton>
          </div>
          <slot
            v-else
            :name="`panel-${item.value}`"
            :item="item"
            :active="isActive(item)"
          />
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.k-tabs {
  width: 100%;
  min-width: 0;
}

.k-tabs__list {
  position: relative;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  overflow-x: auto;
  border-bottom: 1px solid rgba(114, 131, 126, 0.16);
  padding: 0.15rem 0.1rem 0;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.k-tabs__list::-webkit-scrollbar {
  display: none;
}

.k-tabs__list--stretch .k-tabs__tab {
  flex: 1 0 auto;
}

.k-tabs__tab {
  position: relative;
  min-width: max-content;
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  border: 0;
  border-radius: 0.68rem 0.68rem 0 0;
  padding: 0.2rem 0.82rem;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 590;
  letter-spacing: 0.008em;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 150ms ease-out,
    background-color 150ms ease-out,
    transform 100ms ease-out;
}

.k-tabs__tab::after {
  position: absolute;
  right: 0.7rem;
  bottom: -1px;
  left: 0.7rem;
  height: 2px;
  border-radius: 999px 999px 0 0;
  background: var(--k-color-primary, #257360);
  content: "";
  opacity: 0;
  transform: scaleX(0.55);
  transition:
    opacity 150ms ease-out,
    transform 240ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-tabs__tab:hover:not(:disabled) {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.055));
}

.k-tabs__tab:active:not(:disabled) {
  transform: scale(0.97);
}

.k-tabs__tab.is-active {
  color: var(--k-color-primary, #257360);
}

.k-tabs__tab.is-active::after {
  opacity: 1;
  transform: scaleX(1);
}

.k-tabs__tab:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: -0.18rem;
}

.k-tabs__tab:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.k-tabs__badge {
  min-width: 1.2rem;
  height: 1.2rem;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  padding: 0 0.35rem;
  color: var(--k-color-text-muted, #65706d);
  background: rgba(105, 123, 117, 0.1);
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.k-tabs__badge.is-accent {
  color: var(--k-color-primary, #257360);
  background: rgba(37, 115, 96, 0.1);
}

.k-tabs__badge.is-warning {
  color: #8b681f;
  background: rgba(194, 146, 45, 0.12);
}

.k-tabs__badge.is-danger {
  color: var(--k-color-danger, #b34a4a);
  background: rgba(179, 74, 74, 0.1);
}

.k-tabs__panel {
  min-width: 0;
  padding-top: 1rem;
  outline: 0;
}

.k-tabs__panel:focus-visible {
  border-radius: 0.6rem;
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.25rem;
}

.k-tabs__mobile-select {
  position: relative;
  display: none;
}

.k-tabs__state,
.k-tabs__error {
  min-height: 9rem;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.5rem;
}

.k-tabs__state span {
  width: min(24rem, 70vw);
  height: 0.75rem;
  border-radius: 999px;
  background: rgba(108, 128, 122, 0.1);
}

.k-tabs__state span:nth-child(2) {
  width: min(18rem, 55vw);
}

.k-tabs__state span:nth-child(3) {
  width: min(21rem, 62vw);
}

.k-tabs__error {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.72rem;
}

.k-tabs__error strong {
  color: var(--k-color-text, #1d2725);
}

@media (max-width: 40rem) {
  .k-tabs__tab {
    min-height: 2.75rem;
  }

  .k-tabs__list--mobile-select {
    display: none;
  }

  .k-tabs__mobile-select {
    height: 2.75rem;
    display: block;
  }

  .k-tabs__mobile-select > span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .k-tabs__mobile-select select {
    width: 100%;
    height: 100%;
    appearance: none;
    border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.28));
    border-radius: var(--k-radius-control, 0.78rem);
    padding: 0 2.5rem 0 0.9rem;
    color: var(--k-color-text, #1d2725);
    background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
    font: inherit;
    font-size: 0.8rem;
  }

  .k-tabs__mobile-select svg {
    position: absolute;
    top: 50%;
    right: 0.85rem;
    width: 0.85rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    pointer-events: none;
    transform: translateY(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-tabs__tab,
  .k-tabs__tab::after {
    transition: color 100ms ease-out, opacity 100ms ease-out;
  }

  .k-tabs__tab:active:not(:disabled),
  .k-tabs__tab::after {
    transform: none;
  }
}

@media (prefers-contrast: more) {
  .k-tabs__list {
    border-color: currentColor;
  }
}
</style>
