<script
  setup
  lang="ts"
  generic="TRow extends object"
>
import {
  computed,
  ref,
  watchEffect,
  type CSSProperties
} from "vue";
import SortIcon from "../../icons/internal/SortIcon.vue";
import TableExpandIcon from "../../icons/internal/TableExpandIcon.vue";
import KButton from "../button/KButton.vue";
import type {
  KTableColumn,
  KTableProps,
  KTableRowKey,
  KTableSort
} from "./types";

const props = withDefaults(defineProps<KTableProps<TRow>>(), {
  caption: "",
  loading: false,
  loadingRowCount: 5,
  error: "",
  emptyText: "暂无数据",
  showRetry: false,
  visibleColumnKeys: null,
  selectable: false,
  selectedRowKeys: () => [],
  isRowSelectable: () => true,
  expandable: false,
  expandedRowKeys: () => [],
  isRowExpandable: () => true,
  sort: null,
  size: "medium",
  stickyHeader: false,
  maxHeight: undefined,
  minWidth: undefined,
  hoverable: true,
  interactiveRows: false,
  emptyValue: "—",
  rowStatus: undefined
});

const emit = defineEmits<{
  "update:sort": [sort: KTableSort | null];
  "update:selectedRowKeys": [keys: KTableRowKey[]];
  "update:expandedRowKeys": [keys: KTableRowKey[]];
  rowClick: [row: TRow, rowIndex: number];
  retry: [];
}>();

const headerCheckbox = ref<HTMLInputElement | null>(null);
const selectedKeySet = computed(
  () => new Set<KTableRowKey>(props.selectedRowKeys)
);
const expandedKeySet = computed(
  () => new Set<KTableRowKey>(props.expandedRowKeys)
);
const visibleColumns = computed(() => {
  const visibleKeySet = props.visibleColumnKeys === null
    ? null
    : new Set(props.visibleColumnKeys);

  return props.columns.filter(
    (column) =>
      !column.hidden &&
      (visibleKeySet === null || visibleKeySet.has(column.key))
  );
});
const selectableRows = computed(() =>
  props.rows
    .map((row, rowIndex) => ({
      row,
      rowIndex,
      key: getRowKey(row)
    }))
    .filter(({ row }) => props.isRowSelectable(row))
);
const allCurrentRowsSelected = computed(
  () =>
    selectableRows.value.length > 0 &&
    selectableRows.value.every(({ key }) => selectedKeySet.value.has(key))
);
const someCurrentRowsSelected = computed(
  () =>
    !allCurrentRowsSelected.value &&
    selectableRows.value.some(({ key }) => selectedKeySet.value.has(key))
);
const selectedCurrentPageCount = computed(() =>
  selectableRows.value.filter(({ key }) => selectedKeySet.value.has(key)).length
);
const selectedOutsidePageCount = computed(() =>
  Math.max(0, props.selectedRowKeys.length - selectedCurrentPageCount.value)
);
const columnCount = computed(
  () =>
    visibleColumns.value.length +
    (props.selectable ? 1 : 0) +
    (props.expandable ? 1 : 0)
);
const scrollerStyle = computed<CSSProperties>(() => ({
  maxHeight: toCssSize(props.maxHeight)
}));
const tableStyle = computed<CSSProperties>(() => ({
  minWidth: toCssSize(props.minWidth)
}));

watchEffect(() => {
  if (headerCheckbox.value !== null) {
    headerCheckbox.value.indeterminate = someCurrentRowsSelected.value;
  }
});

function getRowKey(row: TRow): KTableRowKey {
  return typeof props.rowKey === "function"
    ? props.rowKey(row)
    : toRowKey(row[props.rowKey]);
}

function toRowKey(value: unknown): KTableRowKey {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  throw new TypeError("KTable rowKey 必须解析为 string 或 number");
}

function getCellValue(
  row: TRow,
  rowIndex: number,
  column: KTableColumn<TRow>
): unknown {
  if (typeof column.accessor === "function") {
    return column.accessor(row, rowIndex);
  }
  if (column.accessor !== undefined) {
    return row[column.accessor];
  }

  return (row as Record<string, unknown>)[column.key];
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return props.emptyValue;
  }

  return String(value);
}

function getColumnStyle(
  column: KTableColumn<TRow>,
  columnIndex: number
): CSSProperties {
  const fixedOffset = getFixedOffset(column, columnIndex);

  return {
    width: toCssSize(column.width),
    minWidth: toCssSize(column.minWidth),
    textAlign: column.align ?? "left",
    left: column.fixed === "left" ? fixedOffset : undefined,
    right: column.fixed === "right" ? fixedOffset : undefined
  };
}

function getFixedOffset(
  column: KTableColumn<TRow>,
  columnIndex: number
): string | undefined {
  if (column.fixed === undefined) {
    return undefined;
  }

  const auxiliaryOffset =
    column.fixed === "left"
      ? (props.selectable ? 48 : 0) + (props.expandable ? 44 : 0)
      : 0;
  const relevantColumns =
    column.fixed === "left"
      ? visibleColumns.value.slice(0, columnIndex)
      : visibleColumns.value.slice(columnIndex + 1);
  const offset = relevantColumns
    .filter((candidate) => candidate.fixed === column.fixed)
    .reduce((total, candidate) => total + getColumnPixelWidth(candidate), auxiliaryOffset);

  return `${offset}px`;
}

function getColumnPixelWidth(column: KTableColumn<TRow>): number {
  const width = column.width ?? column.minWidth;
  if (typeof width === "number") {
    return width;
  }
  if (typeof width === "string" && /^\d+(?:\.\d+)?px$/.test(width)) {
    return Number.parseFloat(width);
  }

  return 0;
}

function toCssSize(value: string | number | undefined): string | undefined {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

function getAriaSort(
  column: KTableColumn<TRow>
): "ascending" | "descending" | "none" | undefined {
  if (!column.sortable) {
    return undefined;
  }
  if (props.sort?.key !== column.key) {
    return "none";
  }

  return props.sort.direction === "asc"
    ? "ascending"
    : "descending";
}

function getSortActionLabel(column: KTableColumn<TRow>): string {
  if (props.sort?.key !== column.key) {
    return `按${column.title}升序排列`;
  }
  if (props.sort.direction === "asc") {
    return `按${column.title}降序排列`;
  }

  return `清除${column.title}排序`;
}

function updateSort(column: KTableColumn<TRow>): void {
  if (!column.sortable) {
    return;
  }

  if (props.sort?.key !== column.key) {
    emit("update:sort", {
      key: column.key,
      direction: "asc"
    });
    return;
  }
  if (props.sort.direction === "asc") {
    emit("update:sort", {
      key: column.key,
      direction: "desc"
    });
    return;
  }

  emit("update:sort", null);
}

function updateAllSelection(event: Event): void {
  const shouldSelect = (event.target as HTMLInputElement).checked;
  const currentPageKeys = new Set(
    selectableRows.value.map(({ key }) => key)
  );
  const nextKeys = props.selectedRowKeys.filter(
    (key) => !currentPageKeys.has(key)
  );

  if (shouldSelect) {
    nextKeys.push(...currentPageKeys);
  }

  emit("update:selectedRowKeys", nextKeys);
}

function updateRowSelection(row: TRow, event: Event): void {
  const key = getRowKey(row);
  const shouldSelect = (event.target as HTMLInputElement).checked;
  const nextKeys = new Set(props.selectedRowKeys);

  if (shouldSelect) {
    nextKeys.add(key);
  } else {
    nextKeys.delete(key);
  }

  emit("update:selectedRowKeys", [...nextKeys]);
}

function toggleRowExpansion(row: TRow): void {
  if (!props.isRowExpandable(row)) {
    return;
  }

  const key = getRowKey(row);
  const nextKeys = new Set(props.expandedRowKeys);
  if (nextKeys.has(key)) {
    nextKeys.delete(key);
  } else {
    nextKeys.add(key);
  }

  emit("update:expandedRowKeys", [...nextKeys]);
}

function getRowStatus(
  row: TRow,
  rowIndex: number
): string | undefined {
  const status = props.rowStatus?.(row, rowIndex);
  return status === "default" ? undefined : status;
}

function handleRowClick(row: TRow, rowIndex: number): void {
  if (!props.interactiveRows) {
    return;
  }

  emit("rowClick", row, rowIndex);
}

function handleRowKeydown(
  event: KeyboardEvent,
  row: TRow,
  rowIndex: number
): void {
  if (
    !props.interactiveRows ||
    (event.key !== "Enter" && event.key !== " ")
  ) {
    return;
  }

  event.preventDefault();
  handleRowClick(row, rowIndex);
}
</script>

<template>
  <div
    class="k-table"
    :class="{
      'k-table--sticky': stickyHeader,
      'k-table--hoverable': hoverable,
      [`k-table--${size}`]: true
    }"
  >
    <div
      v-if="selectable && selectedRowKeys.length > 0"
      class="k-table__selection-summary"
      role="status"
      aria-live="polite"
    >
      <slot
        name="selection-summary"
        :selected-count="selectedRowKeys.length"
        :current-page-count="selectedCurrentPageCount"
        :outside-page-count="selectedOutsidePageCount"
      >
        <span>已选择 {{ selectedRowKeys.length }} 项</span>
        <slot
          v-if="selectedOutsidePageCount > 0"
          name="cross-page-selection"
          :outside-page-count="selectedOutsidePageCount"
        >
          <span class="k-table__selection-cross-page">
            其中 {{ selectedOutsidePageCount }} 项来自其他页
          </span>
        </slot>
      </slot>
    </div>
    <div class="k-table__scroller" :style="scrollerStyle">
      <table :aria-busy="loading" :style="tableStyle">
        <caption v-if="caption" class="k-table__caption">
          {{ caption }}
        </caption>
        <thead>
          <tr>
            <th
              v-if="expandable"
              class="k-table__expand-cell k-table__auxiliary-fixed"
              scope="col"
            >
              <span class="k-table__visually-hidden">行详情</span>
            </th>
            <th
              v-if="selectable"
              class="k-table__selection-cell k-table__auxiliary-fixed"
              :class="{ 'has-expand-column': expandable }"
              scope="col"
            >
              <label class="k-table__selection-target">
                <input
                  ref="headerCheckbox"
                  class="k-table__checkbox"
                  type="checkbox"
                  :checked="allCurrentRowsSelected"
                  :disabled="selectableRows.length === 0 || loading"
                  aria-label="选择全部当前行"
                  @change="updateAllSelection"
                />
              </label>
            </th>
            <th
              v-for="(column, columnIndex) in visibleColumns"
              :key="column.key"
              scope="col"
              :data-column-key="column.key"
              :aria-sort="getAriaSort(column)"
              :title="column.headerHint || undefined"
              :class="{
                'is-fixed-left': column.fixed === 'left',
                'is-fixed-right': column.fixed === 'right'
              }"
              :style="getColumnStyle(column, columnIndex)"
            >
              <div class="k-table__header-content">
                <button
                  v-if="column.sortable"
                  class="k-table__sort-button"
                  type="button"
                  :aria-label="getSortActionLabel(column)"
                  @click="updateSort(column)"
                >
                  <slot
                    :name="`header-${column.key}`"
                    :column="column"
                  >
                    <span>{{ column.title }}</span>
                  </slot>
                  <SortIcon
                    class="k-table__sort-icon"
                    :direction="
                      sort?.key === column.key ? sort.direction : undefined
                    "
                  />
                </button>
                <slot
                  v-else
                  :name="`header-${column.key}`"
                  :column="column"
                >
                  {{ column.title }}
                </slot>
                <slot
                  :name="`header-tooltip-${column.key}`"
                  :column="column"
                />
              </div>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr
            v-for="loadingIndex in loadingRowCount"
            :key="`loading-${loadingIndex}`"
            class="k-table__loading-row"
            aria-hidden="true"
          >
            <td v-if="expandable" class="k-table__expand-cell">
              <span class="k-table__skeleton k-table__skeleton--checkbox"></span>
            </td>
            <td v-if="selectable" class="k-table__selection-cell">
              <span class="k-table__skeleton k-table__skeleton--checkbox"></span>
            </td>
            <td
              v-for="(column, columnIndex) in visibleColumns"
              :key="column.key"
              :style="getColumnStyle(column, columnIndex)"
            >
              <span class="k-table__skeleton"></span>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="error">
          <tr>
            <td :colspan="columnCount" class="k-table__state-cell">
              <slot name="error" :error="error" :retry="() => emit('retry')">
                <div class="k-table__state" role="alert">
                  <strong>数据加载失败</strong>
                  <span>{{ error }}</span>
                  <KButton
                    v-if="showRetry"
                    variant="secondary"
                    size="small"
                    @click="emit('retry')"
                  >
                    重新加载
                  </KButton>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="rows.length === 0">
          <tr>
            <td :colspan="columnCount" class="k-table__state-cell">
              <slot name="empty">
                <div class="k-table__state">
                  <strong>{{ emptyText }}</strong>
                  <span>调整筛选条件或稍后再试。</span>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <template
            v-for="(row, rowIndex) in rows"
            :key="getRowKey(row)"
          >
            <tr
              class="k-table__data-row"
              :data-row-key="getRowKey(row)"
              :data-row-status="getRowStatus(row, rowIndex)"
              :aria-selected="
                selectable
                  ? selectedKeySet.has(getRowKey(row))
                  : undefined
              "
              :class="{
                'is-selected': selectedKeySet.has(getRowKey(row)),
                'is-interactive': interactiveRows,
                [`is-status-${getRowStatus(row, rowIndex)}`]:
                  getRowStatus(row, rowIndex)
              }"
              :tabindex="interactiveRows ? 0 : undefined"
              @click="handleRowClick(row, rowIndex)"
              @keydown="handleRowKeydown($event, row, rowIndex)"
            >
              <td
                v-if="expandable"
                class="k-table__expand-cell k-table__auxiliary-fixed"
                @click.stop
              >
                <button
                  class="k-table__expand-button"
                  type="button"
                  :disabled="!isRowExpandable(row)"
                  :aria-expanded="expandedKeySet.has(getRowKey(row))"
                  :aria-controls="`k-table-detail-${getRowKey(row)}`"
                  :aria-label="
                    `${expandedKeySet.has(getRowKey(row)) ? '收起' : '展开'}第 ${rowIndex + 1} 行详情`
                  "
                  @click="toggleRowExpansion(row)"
                >
                  <TableExpandIcon />
                </button>
              </td>
              <td
                v-if="selectable"
                class="k-table__selection-cell k-table__auxiliary-fixed"
                :class="{ 'has-expand-column': expandable }"
                @click.stop
              >
                <label class="k-table__selection-target">
                  <input
                    class="k-table__checkbox"
                    type="checkbox"
                    :checked="selectedKeySet.has(getRowKey(row))"
                    :disabled="!isRowSelectable(row)"
                    :aria-label="`选择第 ${rowIndex + 1} 行`"
                    @change="updateRowSelection(row, $event)"
                  />
                </label>
              </td>
              <td
                v-for="(column, columnIndex) in visibleColumns"
                :key="column.key"
                :data-column-key="column.key"
                :class="{
                  'is-ellipsis': column.ellipsis,
                  'is-fixed-left': column.fixed === 'left',
                  'is-fixed-right': column.fixed === 'right'
                }"
                :style="getColumnStyle(column, columnIndex)"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :row-index="rowIndex"
                  :column="column"
                  :value="getCellValue(row, rowIndex, column)"
                >
                  {{ formatCellValue(getCellValue(row, rowIndex, column)) }}
                </slot>
              </td>
            </tr>
            <tr
              v-if="
                expandable &&
                isRowExpandable(row) &&
                expandedKeySet.has(getRowKey(row))
              "
              :id="`k-table-detail-${getRowKey(row)}`"
              class="k-table__detail-row"
            >
              <td :colspan="columnCount" class="k-table__detail-cell">
                <slot
                  name="detail"
                  :row="row"
                  :row-index="rowIndex"
                  :collapse="() => toggleRowExpansion(row)"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.k-table {
  --k-table-header-padding-block: 0.38rem;
  --k-table-cell-padding-block: 0.82rem;
  --k-table-cell-padding-inline: 1rem;

  overflow: hidden;
  border: 1px solid var(--k-table-border, rgba(114, 131, 126, 0.2));
  border-radius: var(--k-table-radius, 1rem);
  color: var(--k-color-text, #1d2725);
  background: var(--k-table-surface, rgba(255, 255, 255, 0.7));
  box-shadow:
    0 1.25rem 2.8rem -2.5rem rgba(39, 62, 56, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
}

.k-table__scroller {
  width: 100%;
  overflow: auto;
  overscroll-behavior: contain;
}

.k-table__selection-summary {
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-bottom: 1px solid var(--k-table-divider, rgba(114, 131, 126, 0.13));
  color: var(--k-color-text, #1d2725);
  background: var(--k-table-selection-summary, rgba(37, 115, 96, 0.055));
  font-size: 0.74rem;
  font-weight: 620;
}

.k-table__selection-cross-page {
  color: var(--k-color-text-muted, #65706d);
  font-weight: 500;
}

table {
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  font-size: 0.8rem;
  font-optical-sizing: auto;
  font-variant-numeric: tabular-nums;
}

.k-table__caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

th,
td {
  border-bottom: 1px solid var(--k-table-divider, rgba(114, 131, 126, 0.13));
  vertical-align: middle;
}

th {
  padding:
    var(--k-table-header-padding-block)
    var(--k-table-cell-padding-inline);
  color: var(--k-color-text-muted, #65706d);
  background: var(--k-table-header-surface, rgba(242, 246, 244, 0.84));
  font-size: 0.68rem;
  font-weight: 660;
  letter-spacing: 0.035em;
  white-space: nowrap;
}

th.is-fixed-left,
th.is-fixed-right,
td.is-fixed-left,
td.is-fixed-right,
.k-table__auxiliary-fixed {
  position: sticky;
  z-index: 2;
  background: var(--k-table-fixed-surface, rgba(250, 252, 251, 0.98));
}

th.is-fixed-left,
th.is-fixed-right {
  z-index: 4;
  background: var(--k-table-header-surface, rgba(242, 246, 244, 0.98));
}

.k-table__expand-cell.k-table__auxiliary-fixed {
  left: 0;
}

.k-table__selection-cell.k-table__auxiliary-fixed {
  left: 0;
}

.k-table__selection-cell.k-table__auxiliary-fixed.has-expand-column {
  left: 2.75rem;
}

td {
  padding:
    var(--k-table-cell-padding-block)
    var(--k-table-cell-padding-inline);
}

.k-table--small {
  --k-table-header-padding-block: 0.3rem;
  --k-table-cell-padding-block: 0.38rem;
  --k-table-cell-padding-inline: 0.75rem;
}

.k-table--small .k-table__selection-target {
  width: 2rem;
  height: 2rem;
}

.k-table--small .k-table__sort-button {
  min-height: 2rem;
}

.k-table--sticky th {
  position: sticky;
  top: 0;
  z-index: 1;
  -webkit-backdrop-filter: blur(1rem) saturate(145%);
  backdrop-filter: blur(1rem) saturate(145%);
  box-shadow: 0 0.75rem 1rem -1rem rgba(39, 62, 56, 0.32);
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr {
  background: transparent;
  transition:
    background-color 160ms ease-out,
    box-shadow 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-table--hoverable .k-table__data-row:hover {
  background: var(--k-table-row-hover, rgba(37, 115, 96, 0.045));
}

tbody tr.is-selected {
  background: var(--k-table-row-selected, rgba(37, 115, 96, 0.075));
  box-shadow: inset 0.18rem 0 0 var(--k-color-primary, #257360);
}

tbody tr.is-status-success {
  box-shadow: inset 0.16rem 0 0 var(--k-color-success, #2d826b);
}

tbody tr.is-status-warning {
  box-shadow: inset 0.16rem 0 0 var(--k-color-warning, #b7832f);
}

tbody tr.is-status-danger {
  box-shadow: inset 0.16rem 0 0 var(--k-color-danger, #b34a4a);
}

tbody tr.is-status-muted {
  color: var(--k-color-text-muted, #65706d);
  background: rgba(105, 123, 117, 0.035);
}

tbody tr.is-interactive {
  cursor: pointer;
  touch-action: manipulation;
}

tbody tr.is-interactive:active {
  background: var(--k-table-row-pressed, rgba(37, 115, 96, 0.095));
  box-shadow: inset 0.18rem 0 0 var(--k-color-primary, #257360);
  transition-duration: 80ms;
}

tbody tr.is-interactive:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.14));
  outline-offset: -0.2rem;
}

.k-table__selection-cell {
  width: 3rem;
  padding: 0.25rem;
  text-align: center;
}

.k-table__expand-cell {
  width: 2.75rem;
  padding: 0.25rem;
  text-align: center;
}

.k-table__expand-button {
  width: 2rem;
  height: 2rem;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 0.55rem;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}

.k-table__expand-button:hover:not(:disabled) {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-table__expand-button:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

.k-table__expand-button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.k-table__expand-button svg {
  width: 0.85rem;
  height: 0.85rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
  transition: transform 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-table__expand-button[aria-expanded="true"] svg {
  transform: rotate(90deg);
}

.k-table__detail-cell {
  padding: 1rem;
  background: var(--k-table-detail-surface, rgba(242, 246, 244, 0.46));
}

.k-table__visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.k-table__selection-target {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.65rem;
  cursor: pointer;
  touch-action: manipulation;
}

.k-table__selection-target:hover {
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-table__selection-target:has(.k-table__checkbox:disabled) {
  cursor: not-allowed;
}

.k-table__selection-target:has(.k-table__checkbox:disabled):hover {
  background: transparent;
}

.k-table__checkbox {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: var(--k-color-primary, #257360);
  cursor: pointer;
}

.k-table__checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.k-table__checkbox:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.16rem;
}

.k-table__sort-button {
  min-width: 0;
  min-height: 2.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  border-radius: 0.4rem;
  padding: 0.2rem 0.3rem;
  color: inherit;
  background: transparent;
  font: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}

.k-table__header-content {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.k-table__sort-button:hover {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-table__sort-button:active {
  transform: scale(0.97);
  transition-duration: 80ms;
}

.k-table__sort-button:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

.k-table__sort-icon {
  width: 0.8rem;
  height: 0.8rem;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

td.is-ellipsis {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-table__state-cell {
  height: 15rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.k-table__state {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  color: var(--k-color-text-muted, #65706d);
}

.k-table__state strong {
  color: var(--k-color-text, #1d2725);
  font-size: 0.88rem;
  font-weight: 650;
}

.k-table__state span {
  font-size: 0.75rem;
}

.k-table__state :deep(.k-button) {
  margin-top: 0.35rem;
}

.k-table__loading-row {
  pointer-events: none;
}

.k-table__skeleton {
  position: relative;
  width: min(10rem, 72%);
  height: 0.7rem;
  overflow: hidden;
  display: block;
  border-radius: 999px;
  background: rgba(108, 128, 122, 0.1);
}

.k-table__skeleton::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.72),
    transparent
  );
  content: "";
  transform: translateX(-100%);
  animation: k-table-shimmer 1.5s var(--k-ease-spring, ease-out) infinite;
}

.k-table__skeleton--checkbox {
  width: 0.95rem;
  height: 0.95rem;
  margin-inline: auto;
  border-radius: 0.25rem;
}

@keyframes k-table-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  tbody tr,
  .k-table__sort-button,
  .k-table__expand-button svg {
    transition: none;
  }

  .k-table__sort-button:active {
    transform: none;
  }

  .k-table__skeleton::after {
    animation: none;
    opacity: 0;
  }
}

@media (max-width: 40rem) {
  .k-table__selection-target {
    width: 2.75rem;
    height: 2.75rem;
  }

  .k-table__sort-button {
    min-height: 2.75rem;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-table,
  th {
    background: var(--k-color-surface, #ffffff);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-table,
  th,
  td {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
