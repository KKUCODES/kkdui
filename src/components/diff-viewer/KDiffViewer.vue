<script setup lang="ts">
import { computed } from "vue";
import type {
  KDiffLine,
  KDiffViewerProps
} from "./types";

const props = withDefaults(defineProps<KDiffViewerProps>(), {
  mode: "auto",
  beforeLabel: "修改前",
  afterLabel: "修改后",
  showUnchanged: false,
  maxHeight: 420,
  emptyText: "内容没有变化"
});

const resolvedMode = computed(() => {
  if (props.mode !== "auto") {
    return props.mode;
  }
  return typeof props.before === "string" && typeof props.after === "string"
    ? "text"
    : "json";
});
const lines = computed<KDiffLine[]>(() =>
  resolvedMode.value === "text"
    ? createTextDiff(String(props.before ?? ""), String(props.after ?? ""))
    : createJsonDiff(props.before, props.after)
);
const visibleLines = computed(() =>
  props.showUnchanged
    ? lines.value
    : lines.value.filter((line) => line.type !== "equal")
);
const style = computed(() => ({
  maxHeight:
    typeof props.maxHeight === "number"
      ? `${props.maxHeight}px`
      : props.maxHeight
}));

function createTextDiff(before: string, after: string): KDiffLine[] {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const count = Math.max(beforeLines.length, afterLines.length);
  return Array.from({ length: count }, (_, index) => {
    const left = beforeLines[index];
    const right = afterLines[index];
    const type =
      left === undefined
        ? "added"
        : right === undefined
          ? "removed"
          : left === right
            ? "equal"
            : "modified";
    return {
      key: `line-${index}`,
      type,
      before: left ?? "",
      after: right ?? ""
    };
  });
}

function createJsonDiff(before: unknown, after: unknown): KDiffLine[] {
  const left = flatten(before);
  const right = flatten(after);
  const keys = [...new Set([...left.keys(), ...right.keys()])].sort();
  return keys.map((key) => {
    const hasBefore = left.has(key);
    const hasAfter = right.has(key);
    const beforeValue = left.get(key) ?? "";
    const afterValue = right.get(key) ?? "";
    return {
      key,
      type: !hasBefore
        ? "added"
        : !hasAfter
          ? "removed"
          : beforeValue === afterValue
            ? "equal"
            : "modified",
      before: beforeValue,
      after: afterValue
    };
  });
}

function flatten(value: unknown, path = "$", output = new Map<string, string>()): Map<string, string> {
  if (Array.isArray(value)) {
    if (value.length === 0) output.set(path, "[]");
    value.forEach((item, index) => flatten(item, `${path}[${index}]`, output));
    return output;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) output.set(path, "{}");
    entries.forEach(([key, item]) => flatten(item, `${path}.${key}`, output));
    return output;
  }
  output.set(path, JSON.stringify(value));
  return output;
}
</script>

<template>
  <section class="k-diff-viewer" aria-label="变更对比">
    <header>
      <strong>字段 / 行</strong>
      <span>{{ beforeLabel }}</span>
      <span>{{ afterLabel }}</span>
      <slot name="actions" />
    </header>
    <div class="k-diff-viewer__body" :style="style">
      <div v-if="visibleLines.length === 0" class="k-diff-viewer__empty">
        {{ emptyText }}
      </div>
      <template v-else>
        <div
          v-for="line in visibleLines"
          :key="line.key"
          class="k-diff-viewer__row"
          :class="`is-${line.type}`"
        >
          <code class="k-diff-viewer__key">{{ line.key }}</code>
          <code class="k-diff-viewer__before">
            <span aria-hidden="true">{{ line.type === "added" ? " " : "−" }}</span>
            {{ line.before || " " }}
          </code>
          <code class="k-diff-viewer__after">
            <span aria-hidden="true">{{ line.type === "removed" ? " " : "+" }}</span>
            {{ line.after || " " }}
          </code>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.k-diff-viewer {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(114, 131, 126, 0.22);
  border-radius: 0.9rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(255, 255, 255, 0.68);
}

.k-diff-viewer header,
.k-diff-viewer__row {
  min-width: 48rem;
  display: grid;
  grid-template-columns: minmax(10rem, 0.7fr) minmax(16rem, 1fr) minmax(16rem, 1fr);
}

.k-diff-viewer header {
  position: relative;
  align-items: center;
  border-bottom: 1px solid rgba(114, 131, 126, 0.16);
  color: var(--k-color-text-muted, #65706d);
  background: rgba(242, 246, 244, 0.82);
  font-size: 0.68rem;
  font-weight: 640;
}

.k-diff-viewer header > * {
  padding: 0.55rem 0.75rem;
}

.k-diff-viewer header > :last-child:not(:nth-child(3)) {
  position: absolute;
  top: 50%;
  right: 0.45rem;
  transform: translateY(-50%);
}

.k-diff-viewer__body {
  overflow: auto;
  overscroll-behavior: contain;
}

.k-diff-viewer__row {
  border-bottom: 1px solid rgba(114, 131, 126, 0.1);
}

.k-diff-viewer__row:last-child {
  border-bottom: 0;
}

.k-diff-viewer__row code {
  min-width: 0;
  padding: 0.48rem 0.75rem;
  overflow-wrap: anywhere;
  font-family: var(--font-mono, monospace);
  font-size: 0.67rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.k-diff-viewer__row code + code {
  border-left: 1px solid rgba(114, 131, 126, 0.1);
}

.k-diff-viewer__row code > span {
  display: inline-block;
  width: 1rem;
  color: var(--k-color-text-subtle, #929d99);
  user-select: none;
}

.k-diff-viewer__key {
  color: var(--k-color-text-muted, #65706d);
  background: rgba(242, 246, 244, 0.45);
}

.k-diff-viewer__row.is-added .k-diff-viewer__after,
.k-diff-viewer__row.is-modified .k-diff-viewer__after {
  color: #175b49;
  background: rgba(37, 115, 96, 0.1);
}

.k-diff-viewer__row.is-removed .k-diff-viewer__before,
.k-diff-viewer__row.is-modified .k-diff-viewer__before {
  color: #8d3838;
  background: rgba(179, 74, 74, 0.09);
}

.k-diff-viewer__row.is-equal {
  opacity: 0.65;
}

.k-diff-viewer__empty {
  min-height: 8rem;
  display: grid;
  place-items: center;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.72rem;
}

@media (prefers-reduced-transparency: reduce) {
  .k-diff-viewer {
    background: var(--k-color-surface, #fff);
  }
}
</style>
