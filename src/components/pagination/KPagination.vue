<script setup lang="ts">
import { computed, useId } from "vue";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "../../icons";
import type { KPaginationProps } from "./types";

type PaginationItem =
  | {
      readonly type: "page";
      readonly page: number;
      readonly key: string;
    }
  | {
      readonly type: "ellipsis";
      readonly key: string;
    };

const props = withDefaults(defineProps<KPaginationProps>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
  siblingCount: 1,
  showTotal: true,
  showPageSize: true,
  hideOnSinglePage: false,
  disabled: false,
  ariaLabel: "分页导航",
  size: "medium"
});

const emit = defineEmits<{
  "update:page": [page: number];
  "update:pageSize": [pageSize: number];
}>();

const pageSizeSelectId = `k-pagination-size-${useId()}`;
const normalizedTotal = computed(() =>
  Math.max(0, Math.trunc(toFiniteNumber(props.total, 0)))
);
const normalizedPageSize = computed(() =>
  Math.max(1, Math.trunc(toFiniteNumber(props.pageSize, 1)))
);
const normalizedSiblingCount = computed(() =>
  Math.max(0, Math.trunc(toFiniteNumber(props.siblingCount, 1)))
);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(normalizedTotal.value / normalizedPageSize.value))
);
const currentPage = computed(() =>
  clamp(
    Math.trunc(toFiniteNumber(props.page, 1)),
    1,
    totalPages.value
  )
);
const rangeStart = computed(() =>
  normalizedTotal.value === 0
    ? 0
    : (currentPage.value - 1) * normalizedPageSize.value + 1
);
const rangeEnd = computed(() =>
  Math.min(
    normalizedTotal.value,
    currentPage.value * normalizedPageSize.value
  )
);
const normalizedPageSizeOptions = computed(() => {
  const values = new Set<number>([normalizedPageSize.value]);

  for (const option of props.pageSizeOptions) {
    const normalizedOption = Math.trunc(toFiniteNumber(option, 0));
    if (normalizedOption > 0) {
      values.add(normalizedOption);
    }
  }

  return [...values].sort((left, right) => left - right);
});
const paginationItems = computed<PaginationItem[]>(() =>
  createPaginationItems(
    currentPage.value,
    totalPages.value,
    normalizedSiblingCount.value
  )
);
const isHidden = computed(
  () => props.hideOnSinglePage && totalPages.value <= 1
);

function toFiniteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function createPageItem(page: number): PaginationItem {
  return {
    type: "page",
    page,
    key: `page-${page}`
  };
}

function createPageRange(start: number, end: number): PaginationItem[] {
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => createPageItem(start + index)
  );
}

function createPaginationItems(
  page: number,
  pageCount: number,
  siblingCount: number
): PaginationItem[] {
  const visibleItemCount = siblingCount * 2 + 5;

  if (pageCount <= visibleItemCount) {
    return createPageRange(1, pageCount);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < pageCount - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRangeEnd = 3 + siblingCount * 2;
    return [
      ...createPageRange(1, leftRangeEnd),
      { type: "ellipsis", key: "ellipsis-right" },
      createPageItem(pageCount)
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRangeStart = pageCount - (2 + siblingCount * 2);
    return [
      createPageItem(1),
      { type: "ellipsis", key: "ellipsis-left" },
      ...createPageRange(rightRangeStart, pageCount)
    ];
  }

  return [
    createPageItem(1),
    { type: "ellipsis", key: "ellipsis-left" },
    ...createPageRange(leftSibling, rightSibling),
    { type: "ellipsis", key: "ellipsis-right" },
    createPageItem(pageCount)
  ];
}

function updatePage(nextPage: number): void {
  if (props.disabled) {
    return;
  }

  const normalizedPage = clamp(
    Math.trunc(nextPage),
    1,
    totalPages.value
  );
  if (normalizedPage !== currentPage.value) {
    emit("update:page", normalizedPage);
  }
}

function updatePageSize(event: Event): void {
  if (props.disabled) {
    return;
  }

  const nextPageSize = Number((event.target as HTMLSelectElement).value);
  if (
    !Number.isInteger(nextPageSize) ||
    nextPageSize <= 0 ||
    nextPageSize === normalizedPageSize.value
  ) {
    return;
  }

  emit("update:pageSize", nextPageSize);
  if (currentPage.value !== 1) {
    emit("update:page", 1);
  }
}
</script>

<template>
  <nav
    v-if="!isHidden"
    class="k-pagination"
    :class="[
      `k-pagination--${size}`,
      { 'k-pagination--disabled': disabled }
    ]"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
  >
    <div v-if="showTotal" class="k-pagination__summary">
      <slot
        name="total"
        :total="normalizedTotal"
        :start="rangeStart"
        :end="rangeEnd"
      >
        <template v-if="normalizedTotal === 0">
          共 <strong>0</strong> 条
        </template>
        <template v-else>
          第 <strong>{{ rangeStart }}–{{ rangeEnd }}</strong> 条，共
          <strong>{{ normalizedTotal }}</strong> 条
        </template>
      </slot>
    </div>

    <div class="k-pagination__controls">
      <div v-if="showPageSize" class="k-pagination__size">
        <label class="k-pagination__sr-only" :for="pageSizeSelectId">
          每页显示条数
        </label>
        <select
          :id="pageSizeSelectId"
          class="k-pagination__select"
          :value="normalizedPageSize"
          :disabled="disabled"
          @change="updatePageSize"
        >
          <option
            v-for="option in normalizedPageSizeOptions"
            :key="option"
            :value="option"
          >
            {{ option }} 条/页
          </option>
        </select>
        <ChevronDownIcon
          class="k-pagination__select-icon"
        />
      </div>

      <div class="k-pagination__pager">
        <button
          class="k-pagination__button k-pagination__button--arrow"
          type="button"
          :disabled="disabled || currentPage <= 1"
          aria-label="上一页"
          @click="updatePage(currentPage - 1)"
        >
          <ChevronLeftIcon />
        </button>

        <div class="k-pagination__pages">
          <template v-for="item in paginationItems" :key="item.key">
            <button
              v-if="item.type === 'page'"
              class="k-pagination__button"
              :class="{
                'is-current': item.page === currentPage
              }"
              type="button"
              :disabled="disabled"
              :aria-label="`第 ${item.page} 页`"
              :aria-current="
                item.page === currentPage ? 'page' : undefined
              "
              @click="updatePage(item.page)"
            >
              {{ item.page }}
            </button>
            <span
              v-else
              class="k-pagination__ellipsis"
              aria-hidden="true"
            >
              …
            </span>
          </template>
        </div>

        <span class="k-pagination__compact-status" aria-hidden="true">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="k-pagination__button k-pagination__button--arrow"
          type="button"
          :disabled="disabled || currentPage >= totalPages"
          aria-label="下一页"
          @click="updatePage(currentPage + 1)"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>

    <span
      class="k-pagination__sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      当前第 {{ currentPage }} 页，共 {{ totalPages }} 页
    </span>
  </nav>
</template>

<style scoped>
.k-pagination {
  --k-pagination-control-size: 2.25rem;

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.76rem;
  font-optical-sizing: auto;
  letter-spacing: 0.01em;
}

.k-pagination__summary {
  min-width: 0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.k-pagination__summary strong {
  color: var(--k-color-text, #1d2725);
  font-weight: 650;
}

.k-pagination__controls,
.k-pagination__pager,
.k-pagination__pages {
  min-width: 0;
  display: flex;
  align-items: center;
}

.k-pagination__controls {
  gap: 0.75rem;
}

.k-pagination__pager,
.k-pagination__pages {
  gap: 0.25rem;
}

.k-pagination__size {
  position: relative;
  flex: 0 0 auto;
}

.k-pagination__select {
  height: var(--k-pagination-control-size);
  appearance: none;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.28));
  border-radius: 0.68rem;
  padding: 0 2rem 0 0.72rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  font: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    border-color 160ms ease-out,
    background-color 160ms ease-out,
    box-shadow 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-pagination__select:hover:not(:disabled) {
  border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.42));
}

.k-pagination__select:focus-visible {
  border-color: var(--k-color-primary, #257360);
  outline: 0;
  box-shadow: 0 0 0 0.2rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12));
}

.k-pagination__select:disabled {
  cursor: not-allowed;
}

.k-pagination__select-icon {
  position: absolute;
  top: 50%;
  right: 0.65rem;
  width: 0.75rem;
  height: 0.75rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  pointer-events: none;
  transform: translateY(-50%);
}

.k-pagination__button {
  min-width: 2.25rem;
  height: var(--k-pagination-control-size);
  display: inline-grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 0.68rem;
  padding: 0 0.45rem;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  font-weight: 620;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 150ms ease-out,
    border-color 150ms ease-out,
    background-color 150ms ease-out,
    transform 190ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-pagination__button:hover:not(:disabled):not(.is-current) {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-pagination__button:active:not(:disabled) {
  transform: scale(0.965);
  transition-duration: 80ms;
}

.k-pagination__button:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.1rem;
}

.k-pagination__button.is-current {
  border-color: rgba(37, 115, 96, 0.18);
  color: var(--k-color-primary, #257360);
  background: rgba(37, 115, 96, 0.09);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.k-pagination__button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.k-pagination__button--arrow svg {
  width: 0.9rem;
  height: 0.9rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.k-pagination__ellipsis {
  width: 1.65rem;
  color: var(--k-color-text-subtle, #929d99);
  text-align: center;
  user-select: none;
}

.k-pagination__compact-status {
  display: none;
  min-width: 4rem;
  color: var(--k-color-text, #1d2725);
  font-weight: 620;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.k-pagination__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.k-pagination--disabled {
  opacity: 0.6;
}

@media (min-width: 40.001rem) {
  .k-pagination--small {
    --k-pagination-control-size: 2rem;

    font-size: 0.72rem;
  }

  .k-pagination--small .k-pagination__button {
    min-width: 2rem;
    border-radius: 0.6rem;
  }

  .k-pagination--small .k-pagination__select {
    border-radius: 0.6rem;
  }
}

@media (max-width: 40rem) {
  .k-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.7rem;
  }

  .k-pagination__controls {
    width: 100%;
    justify-content: space-between;
  }

  .k-pagination__pages {
    display: none;
  }

  .k-pagination__compact-status {
    display: inline-block;
  }

  .k-pagination__button {
    min-width: 2.75rem;
    height: 2.75rem;
  }

  .k-pagination__select {
    height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-pagination__button,
  .k-pagination__select {
    transition: color 120ms ease-out, background-color 120ms ease-out;
  }

  .k-pagination__button:active:not(:disabled) {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-pagination__select {
    background: var(--k-color-surface, #ffffff);
  }
}

@media (prefers-contrast: more) {
  .k-pagination__button,
  .k-pagination__select {
    border-color: currentColor;
  }
}
</style>
