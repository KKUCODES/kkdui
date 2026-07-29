<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch
} from "vue";
import {
  MinusIcon,
  SearchIcon
} from "../../icons";
import CheckboxCheckIcon from "../../icons/internal/CheckboxCheckIcon.vue";
import TreeDisclosureIcon from "../../icons/internal/TreeDisclosureIcon.vue";
import type {
  KTreeKey,
  KTreeNode,
  KTreeProps,
  KTreeVisibleNode
} from "./types";

const props = withDefaults(defineProps<KTreeProps>(), {
  ariaLabel: "权限树",
  checkable: true,
  checkStrictly: false,
  searchable: true,
  showToolbar: true,
  searchPlaceholder: "搜索权限节点",
  emptyText: "没有匹配的节点"
});

const emit = defineEmits<{
  check: [keys: KTreeKey[], node: KTreeNode];
  expand: [keys: KTreeKey[], node: KTreeNode];
  select: [node: KTreeNode];
}>();

const checkedKeys = defineModel<KTreeKey[]>("checkedKeys", {
  default: () => []
});
const expandedKeys = defineModel<KTreeKey[]>("expandedKeys", {
  default: () => []
});
const search = defineModel<string>("search", { default: "" });

const treeElement = ref<HTMLElement | null>(null);
const activeKey = ref<KTreeKey | undefined>();

const nodeMap = computed(() => {
  const result = new Map<KTreeKey, KTreeNode>();
  const visit = (nodes: readonly KTreeNode[]) => {
    nodes.forEach((node) => {
      result.set(node.key, node);
      visit(node.children ?? []);
    });
  };
  visit(props.nodes);
  return result;
});

const parentMap = computed(() => {
  const result = new Map<KTreeKey, KTreeKey>();
  const visit = (nodes: readonly KTreeNode[], parent?: KTreeKey) => {
    nodes.forEach((node) => {
      if (parent !== undefined) {
        result.set(node.key, parent);
      }
      visit(node.children ?? [], node.key);
    });
  };
  visit(props.nodes);
  return result;
});

const allNodes = computed(() => Array.from(nodeMap.value.values()));
const checkableNodes = computed(() =>
  allNodes.value.filter((node) => !node.disabled)
);
const expandableNodes = computed(() =>
  allNodes.value.filter((node) => (node.children?.length ?? 0) > 0)
);
const checkedSet = computed(() => new Set(checkedKeys.value));
const expandedSet = computed(() => new Set(expandedKeys.value));
const normalizedSearch = computed(() => search.value.trim().toLocaleLowerCase());

function directlyMatches(node: KTreeNode): boolean {
  const query = normalizedSearch.value;
  return query.length === 0 ||
    `${node.label} ${node.description ?? ""}`.toLocaleLowerCase().includes(query);
}

function branchMatches(node: KTreeNode): boolean {
  return directlyMatches(node) ||
    (node.children ?? []).some((child) => branchMatches(child));
}

const visibleNodes = computed<KTreeVisibleNode[]>(() => {
  const result: KTreeVisibleNode[] = [];
  const filtering = normalizedSearch.value.length > 0;

  const visit = (
    nodes: readonly KTreeNode[],
    level: number,
    parentKey?: KTreeKey,
    parentDirectlyMatched = false
  ) => {
    nodes.forEach((node) => {
      const direct = directlyMatches(node);
      if (filtering && !parentDirectlyMatched && !branchMatches(node)) {
        return;
      }

      result.push({ node, level, parentKey });
      const shouldShowChildren = filtering ||
        expandedSet.value.has(node.key);
      if (shouldShowChildren) {
        visit(
          node.children ?? [],
          level + 1,
          node.key,
          parentDirectlyMatched || direct
        );
      }
    });
  };

  visit(props.nodes, 1);
  return result;
});

const allChecked = computed(() =>
  checkableNodes.value.length > 0 &&
  checkableNodes.value.every((node) => checkedSet.value.has(node.key))
);
const allExpanded = computed(() =>
  expandableNodes.value.length > 0 &&
  expandableNodes.value.every((node) => expandedSet.value.has(node.key))
);

function descendants(node: KTreeNode): KTreeNode[] {
  return (node.children ?? []).flatMap((child) => [
    child,
    ...descendants(child)
  ]);
}

function isChecked(node: KTreeNode): boolean {
  if (checkedSet.value.has(node.key)) {
    return true;
  }
  if (props.checkStrictly || (node.children?.length ?? 0) === 0) {
    return false;
  }
  const children = (node.children ?? []).filter((child) => !child.disabled);
  return children.length > 0 && children.every((child) => isChecked(child));
}

function isIndeterminate(node: KTreeNode): boolean {
  if (props.checkStrictly || isChecked(node)) {
    return false;
  }
  return (node.children ?? []).some((child) =>
    isChecked(child) || isIndeterminate(child)
  );
}

function updateAncestors(keys: Set<KTreeKey>, fromKey: KTreeKey): void {
  let parentKey = parentMap.value.get(fromKey);
  while (parentKey !== undefined) {
    const parent = nodeMap.value.get(parentKey);
    if (parent !== undefined) {
      const children = (parent.children ?? []).filter((child) => !child.disabled);
      if (
        children.length > 0 &&
        children.every((child) => keys.has(child.key))
      ) {
        keys.add(parent.key);
      } else {
        keys.delete(parent.key);
      }
    }
    parentKey = parentMap.value.get(parentKey);
  }
}

function toggleCheck(node: KTreeNode): void {
  if (!props.checkable || node.disabled) {
    return;
  }

  const next = new Set(checkedKeys.value);
  const checking = !isChecked(node);
  const affected = props.checkStrictly
    ? [node]
    : [node, ...descendants(node)];
  affected.forEach((item) => {
    if (!item.disabled) {
      if (checking) {
        next.add(item.key);
      } else {
        next.delete(item.key);
      }
    }
  });
  if (!props.checkStrictly) {
    updateAncestors(next, node.key);
  }
  checkedKeys.value = Array.from(next);
  emit("check", checkedKeys.value, node);
}

function toggleExpand(node: KTreeNode): void {
  if ((node.children?.length ?? 0) === 0) {
    return;
  }
  const next = new Set(expandedKeys.value);
  if (next.has(node.key)) {
    next.delete(node.key);
  } else {
    next.add(node.key);
  }
  expandedKeys.value = Array.from(next);
  emit("expand", expandedKeys.value, node);
}

function selectAll(): void {
  checkedKeys.value = allChecked.value
    ? []
    : checkableNodes.value.map((node) => node.key);
}

function expandAll(): void {
  expandedKeys.value = allExpanded.value
    ? []
    : expandableNodes.value.map((node) => node.key);
}

function focusNode(key: KTreeKey): void {
  activeKey.value = key;
  void nextTick(() => {
    const elements = treeElement.value?.querySelectorAll<HTMLElement>(
      '[role="treeitem"]'
    );
    Array.from(elements ?? [])
      .find((element) => element.dataset.key === String(key))
      ?.focus({ preventScroll: true });
  });
}

function handleNodeKeydown(event: KeyboardEvent, item: KTreeVisibleNode): void {
  const index = visibleNodes.value.findIndex(
    ({ node }) => node.key === item.node.key
  );
  let target: KTreeVisibleNode | undefined;

  if (event.key === "ArrowDown") {
    target = visibleNodes.value[index + 1];
  } else if (event.key === "ArrowUp") {
    target = visibleNodes.value[index - 1];
  } else if (event.key === "Home") {
    target = visibleNodes.value[0];
  } else if (event.key === "End") {
    target = visibleNodes.value.at(-1);
  } else if (event.key === "ArrowRight") {
    if (
      (item.node.children?.length ?? 0) > 0 &&
      !expandedSet.value.has(item.node.key)
    ) {
      toggleExpand(item.node);
    } else {
      target = visibleNodes.value[index + 1];
    }
  } else if (event.key === "ArrowLeft") {
    if (expandedSet.value.has(item.node.key)) {
      toggleExpand(item.node);
    } else if (item.parentKey !== undefined) {
      target = visibleNodes.value.find(
        ({ node }) => node.key === item.parentKey
      );
    }
  } else if (event.key === " " && props.checkable) {
    toggleCheck(item.node);
  } else if (event.key === "Enter") {
    toggleExpand(item.node);
    emit("select", item.node);
  } else {
    return;
  }

  event.preventDefault();
  if (target !== undefined) {
    focusNode(target.node.key);
  }
}

watch(
  visibleNodes,
  (items) => {
    if (!items.some(({ node }) => node.key === activeKey.value)) {
      activeKey.value = items[0]?.node.key;
    }
  },
  { immediate: true }
);

defineExpose({
  selectAll,
  expandAll,
  collapseAll: () => {
    expandedKeys.value = [];
  },
  clearChecked: () => {
    checkedKeys.value = [];
  }
});
</script>

<template>
  <section class="k-tree-shell">
    <div
      v-if="showToolbar"
      class="k-tree__toolbar"
      aria-label="树操作"
    >
      <label v-if="searchable" class="k-tree__search">
        <SearchIcon />
        <span class="k-tree__sr-only">搜索权限节点</span>
        <input
          v-model="search"
          type="search"
          :placeholder="searchPlaceholder"
        />
      </label>
      <div class="k-tree__actions">
        <button
          v-if="checkable"
          type="button"
          :aria-pressed="allChecked"
          @click="selectAll"
        >
          {{ allChecked ? "取消全选" : "全选" }}
        </button>
        <button
          type="button"
          :aria-pressed="allExpanded"
          @click="expandAll"
        >
          {{ allExpanded ? "全部收起" : "全部展开" }}
        </button>
      </div>
    </div>

    <div
      ref="treeElement"
      class="k-tree"
      role="tree"
      :aria-label="ariaLabel"
      :aria-multiselectable="checkable || undefined"
    >
      <div
        v-for="item in visibleNodes"
        :key="item.node.key"
        class="k-tree__item"
        :class="{
          'is-disabled': item.node.disabled,
          'is-checked': isChecked(item.node)
        }"
        role="treeitem"
        :data-key="String(item.node.key)"
        :aria-level="item.level"
        :aria-expanded="
          (item.node.children?.length ?? 0) > 0
            ? expandedSet.has(item.node.key)
            : undefined
        "
        :aria-checked="
          checkable
            ? isIndeterminate(item.node)
              ? 'mixed'
              : isChecked(item.node)
            : undefined
        "
        :aria-disabled="item.node.disabled || undefined"
        :tabindex="activeKey === item.node.key ? 0 : -1"
        :style="{
          '--k-tree-indent': `${0.45 + (item.level - 1) * 1.05}rem`
        }"
        @click="activeKey = item.node.key"
        @focus="activeKey = item.node.key"
        @keydown="handleNodeKeydown($event, item)"
      >
        <button
          v-if="(item.node.children?.length ?? 0) > 0"
          class="k-tree__disclosure"
          type="button"
          tabindex="-1"
          :aria-label="
            expandedSet.has(item.node.key)
              ? `收起${item.node.label}`
              : `展开${item.node.label}`
          "
          @click.stop="toggleExpand(item.node)"
        >
          <TreeDisclosureIcon
            :class="{ 'is-open': expandedSet.has(item.node.key) }"
          />
        </button>
        <span v-else class="k-tree__spacer"></span>

        <label v-if="checkable" class="k-tree__checkbox" @click.stop>
          <input
            type="checkbox"
            tabindex="-1"
            :checked="isChecked(item.node)"
            :disabled="item.node.disabled"
            :aria-label="`选择${item.node.label}`"
            :data-indeterminate="isIndeterminate(item.node) || undefined"
            @change="toggleCheck(item.node)"
          />
          <span aria-hidden="true">
            <MinusIcon v-if="isIndeterminate(item.node)" />
            <CheckboxCheckIcon v-else />
          </span>
        </label>

        <button
          class="k-tree__content"
          type="button"
          tabindex="-1"
          :disabled="item.node.disabled"
          @click="emit('select', item.node)"
          @dblclick="toggleExpand(item.node)"
        >
          <span class="k-tree__label">
            <slot name="label" :node="item.node">
              {{ item.node.label }}
            </slot>
          </span>
          <span
            v-if="item.node.description"
            class="k-tree__description"
          >
            {{ item.node.description }}
          </span>
        </button>
      </div>

      <div v-if="visibleNodes.length === 0" class="k-tree__empty" role="status">
        {{ emptyText }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.k-tree-shell {
  min-width: 0;
  color: var(--k-color-text, #1d2725);
}

.k-tree__toolbar {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.55rem;
}

.k-tree__search {
  position: relative;
  min-width: min(15rem, 100%);
  flex: 1 1 auto;
}

.k-tree__search svg {
  position: absolute;
  top: 50%;
  left: 0.68rem;
  width: 0.9rem;
  height: 0.9rem;
  fill: none;
  stroke: var(--k-color-text-muted, #65706d);
  stroke-linecap: round;
  stroke-width: 1.7;
  transform: translateY(-50%);
  pointer-events: none;
}

.k-tree__search input {
  width: 100%;
  min-height: 2.25rem;
  border: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.22));
  border-radius: 0.68rem;
  padding: 0.42rem 0.75rem 0.42rem 2rem;
  color: inherit;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  font: inherit;
  font-size: 0.76rem;
  outline: none;
  transition: border-color 140ms ease-out, box-shadow 140ms ease-out;
}

.k-tree__search input:focus {
  border-color: var(--k-color-primary, #257360);
  box-shadow: 0 0 0 0.18rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
}

.k-tree__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.3rem;
}

.k-tree__actions button {
  min-height: 2.25rem;
  border: 0;
  border-radius: 0.58rem;
  padding: 0.35rem 0.62rem;
  color: var(--k-color-primary, #257360);
  background: transparent;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 620;
  cursor: pointer;
  touch-action: manipulation;
}

.k-tree__actions button:hover {
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-tree__actions button:focus-visible,
.k-tree__item:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.08rem;
}

.k-tree {
  display: grid;
  gap: 0.12rem;
}

.k-tree__item {
  min-width: 0;
  min-height: 2.35rem;
  display: flex;
  align-items: center;
  gap: 0.34rem;
  border-radius: 0.62rem;
  padding: 0.3rem 0.5rem 0.3rem var(--k-tree-indent);
  transition: background-color 130ms ease-out;
}

.k-tree__item:hover,
.k-tree__item:focus-visible {
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.06));
}

.k-tree__item.is-disabled {
  opacity: 0.52;
}

.k-tree__disclosure,
.k-tree__spacer {
  width: 1.5rem;
  height: 1.5rem;
  flex: 0 0 auto;
}

.k-tree__disclosure {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 0.38rem;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  cursor: pointer;
}

.k-tree__disclosure:hover {
  background: rgba(37, 115, 96, 0.08);
}

.k-tree__disclosure svg {
  width: 0.82rem;
  height: 0.82rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  transition: transform 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-tree__disclosure svg.is-open {
  transform: rotate(90deg);
}

.k-tree__checkbox {
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  cursor: pointer;
}

.k-tree__checkbox input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.k-tree__checkbox span {
  width: 1rem;
  height: 1rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--k-color-border-hover, rgba(72, 94, 88, 0.42));
  border-radius: 0.3rem;
  color: #fff;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  transition: transform 100ms ease-out, background-color 140ms ease-out;
}

.k-tree__checkbox svg {
  width: 0.72rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  opacity: 0;
}

.k-tree__checkbox input:checked + span,
.k-tree__checkbox input[data-indeterminate="true"] + span {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-primary, #257360);
}

.k-tree__checkbox input:checked + span svg,
.k-tree__checkbox input[data-indeterminate="true"] + span svg {
  opacity: 1;
}

.k-tree__checkbox input:active + span {
  transform: scale(0.88);
}

.k-tree__content {
  min-width: 0;
  display: grid;
  flex: 1;
  gap: 0.08rem;
  border: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.k-tree__label {
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 570;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-tree__description {
  overflow: hidden;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.66rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-tree__empty {
  padding: 1.6rem 1rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.75rem;
  text-align: center;
}

.k-tree__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 40rem) {
  .k-tree__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .k-tree__actions button,
  .k-tree__search input {
    min-height: 2.75rem;
  }

  .k-tree__actions {
    justify-content: flex-end;
  }

  .k-tree__item {
    min-height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-tree__disclosure svg,
  .k-tree__checkbox span,
  .k-tree__item {
    transition: none;
  }

  .k-tree__checkbox input:active + span {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-tree__search input,
  .k-tree__checkbox span {
    background: var(--k-color-surface, #fff);
  }
}

@media (prefers-contrast: more) {
  .k-tree__search input,
  .k-tree__checkbox span {
    border-color: currentColor;
  }
}
</style>
