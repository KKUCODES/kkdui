<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  useAttrs,
  useId,
  watch,
  type CSSProperties
} from "vue";
import type { KTextareaProps } from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<KTextareaProps>(), {
  placeholder: "",
  rows: 3,
  minRows: 2,
  maxRows: 8,
  showCount: false,
  autoResize: false,
  disabled: false,
  readonly: false,
  invalid: false,
  size: "medium"
});

const emit = defineEmits<{
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const model = defineModel<string>({ default: "" });
const attrs = useAttrs();
const generatedId = useId();
const textarea = ref<HTMLTextAreaElement | null>(null);
const textareaId = computed(() => props.id ?? `k-textarea-${generatedId}`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const countText = computed(() =>
  props.maxlength === undefined
    ? String(model.value.length)
    : `${model.value.length}/${props.maxlength}`
);

function resize(): void {
  if (!props.autoResize || textarea.value === null) return;
  const element = textarea.value;
  const style = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(style.lineHeight) || 20;
  const verticalPadding =
    (Number.parseFloat(style.paddingTop) || 0) +
    (Number.parseFloat(style.paddingBottom) || 0);
  const border =
    (Number.parseFloat(style.borderTopWidth) || 0) +
    (Number.parseFloat(style.borderBottomWidth) || 0);
  const minHeight = lineHeight * Math.max(1, props.minRows) + verticalPadding + border;
  const maxHeight = lineHeight * Math.max(props.minRows, props.maxRows) + verticalPadding + border;

  element.style.height = "auto";
  const height = Math.min(maxHeight, Math.max(minHeight, element.scrollHeight));
  element.style.height = `${height}px`;
  element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
}

function handleInput(event: Event): void {
  model.value = (event.target as HTMLTextAreaElement).value;
  resize();
}

function focus(): void {
  textarea.value?.focus();
}

function blur(): void {
  textarea.value?.blur();
}

function select(): void {
  textarea.value?.select();
}

watch(
  () => model.value,
  () => void nextTick(resize)
);
watch(
  () => [props.minRows, props.maxRows, props.autoResize],
  () => void nextTick(resize)
);
onMounted(resize);

defineExpose({ focus, blur, select, resize });
</script>

<template>
  <div
    class="k-textarea"
    :class="[
      rootClass,
      `k-textarea--${size}`,
      {
        'k-textarea--invalid': invalid,
        'k-textarea--disabled': disabled,
        'k-textarea--auto-resize': autoResize,
        'k-textarea--with-count': showCount
      }
    ]"
    :style="rootStyle"
  >
    <textarea
      :id="textareaId"
      ref="textarea"
      class="k-textarea__control"
      v-bind="controlAttrs"
      :value="model"
      :name="name"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="invalid"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span
      v-if="showCount"
      class="k-textarea__count"
      aria-live="polite"
    >
      {{ countText }}
    </span>
  </div>
</template>

<style scoped>
.k-textarea {
  --k-textarea-font-size: 0.82rem;
  --k-textarea-padding: 0.78rem 0.9rem;
  position: relative;
  width: 100%;
  min-width: 0;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.32));
  border-radius: var(--k-radius-control, 0.78rem);
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
  transition: border-color 170ms ease-out, box-shadow 180ms ease-out, background-color 170ms ease-out;
}

.k-textarea--small { --k-textarea-font-size: 0.76rem; --k-textarea-padding: 0.62rem 0.75rem; }
.k-textarea--large { --k-textarea-font-size: 0.88rem; --k-textarea-padding: 0.9rem 1rem; }
.k-textarea:hover:not(.k-textarea--disabled) { border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.46)); }
.k-textarea:focus-within {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-control-surface-focus, rgba(255, 255, 255, 0.94));
  box-shadow: 0 0 0 0.22rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12));
}
.k-textarea--invalid { border-color: var(--k-color-danger, #b34a4a); }
.k-textarea--invalid:focus-within { box-shadow: 0 0 0 0.22rem var(--k-color-danger-ring, rgba(179, 74, 74, 0.12)); }
.k-textarea--disabled { opacity: 0.58; cursor: not-allowed; }
.k-textarea__control {
  width: 100%;
  min-height: 100%;
  display: block;
  box-sizing: border-box;
  border: 0;
  border-radius: inherit;
  padding: var(--k-textarea-padding);
  resize: vertical;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: var(--k-textarea-font-size);
  line-height: 1.55;
  outline: 0;
}
.k-textarea__control::placeholder { color: var(--k-color-text-subtle, #929d99); }
.k-textarea__control:disabled { cursor: not-allowed; resize: none; }
.k-textarea--auto-resize .k-textarea__control { resize: none; }
.k-textarea--with-count .k-textarea__control { padding-bottom: 1.75rem; }
.k-textarea__count {
  position: absolute;
  right: 0.7rem;
  bottom: 0.45rem;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.68rem;
  line-height: 1;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .k-textarea { transition: border-color 100ms ease-out, background-color 100ms ease-out; }
}
@media (prefers-reduced-transparency: reduce) {
  .k-textarea { background: var(--k-color-surface, #fff); }
}
@media (max-width: 40rem) {
  .k-textarea--small { --k-textarea-font-size: 0.82rem; --k-textarea-padding: 0.75rem 0.85rem; }
}
@media (prefers-contrast: more) {
  .k-textarea { border-color: currentColor; }
}
</style>
