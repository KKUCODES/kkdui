<script setup lang="ts">
import { computed, ref, useAttrs, useId, type CSSProperties } from "vue";
import type {
  KTagInputProps,
  KTagRejection,
  KTagRejectReason
} from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<KTagInputProps>(), {
  placeholder: "输入后按 Enter",
  size: "medium",
  disabled: false,
  invalid: false,
  maxTags: Number.POSITIVE_INFINITY,
  maxTagLength: 100,
  separatorPattern: "[,，;；\\n\\t]+",
  allowDuplicates: false,
  addOnBlur: true,
  ariaLabel: "标签输入"
});

const emit = defineEmits<{
  change: [value: string[]];
  reject: [rejections: KTagRejection[]];
}>();

const model = defineModel<string[]>({ default: () => [] });
const attrs = useAttrs();
const generatedId = useId();
const input = ref<HTMLInputElement | null>(null);
const draft = ref("");
const message = ref("");
const inputId = computed(() => props.id ?? `k-tag-input-${generatedId}`);
const messageId = computed(() => `${inputId.value}-message`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const isInvalid = computed(() => props.invalid || message.value !== "");

const rejectionMessages: Record<KTagRejectReason, string> = {
  empty: "标签不能为空",
  duplicate: "标签已存在",
  format: "标签格式不正确",
  length: "标签过长",
  limit: "已达到标签数量上限"
};

function reject(value: string, reason: KTagRejectReason, customMessage?: string): KTagRejection {
  return { value, reason, message: customMessage ?? rejectionMessages[reason] };
}

function validationError(value: string, current: readonly string[]): KTagRejection | null {
  if (!value) return reject(value, "empty");
  if (value.length > props.maxTagLength) return reject(value, "length");
  if (!props.allowDuplicates && current.includes(value)) return reject(value, "duplicate");
  if (current.length >= props.maxTags) return reject(value, "limit");
  if (props.pattern) {
    props.pattern.lastIndex = 0;
    if (!props.pattern.test(value)) return reject(value, "format");
  }
  const result = props.validator?.(value);
  if (result === false) return reject(value, "format");
  if (typeof result === "string") return reject(value, "format", result);
  return null;
}

function addValues(values: readonly string[]): boolean {
  if (props.disabled) return false;
  const next = [...model.value];
  const rejections: KTagRejection[] = [];
  for (const rawValue of values) {
    const value = rawValue.trim();
    const problem = validationError(value, next);
    if (problem) rejections.push(problem);
    else next.push(value);
  }
  if (next.length !== model.value.length) {
    model.value = next;
    emit("change", next);
  }
  if (rejections.length) {
    message.value = rejections[0]!.message;
    emit("reject", rejections);
  } else {
    message.value = "";
  }
  return rejections.length === 0;
}

function commitDraft(): void {
  const value = draft.value.trim();
  if (!value) return;
  if (addValues([value])) draft.value = "";
}

function remove(index: number): void {
  if (props.disabled) return;
  const next = model.value.filter((_, currentIndex) => currentIndex !== index);
  model.value = next;
  emit("change", next);
  message.value = "";
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    commitDraft();
  } else if (event.key === "Backspace" && draft.value === "" && model.value.length) {
    remove(model.value.length - 1);
  }
}

function handlePaste(event: ClipboardEvent): void {
  const pasted = event.clipboardData?.getData("text") ?? "";
  if (!pasted) return;
  const separator = new RegExp(props.separatorPattern, "g");
  const values = pasted.split(separator).filter((value) => value.trim());
  if (values.length <= 1 && !separator.test(pasted)) return;
  event.preventDefault();
  addValues(values);
}

function focus(): void {
  input.value?.focus();
}

defineExpose({ focus, addValues, clear: () => { model.value = []; emit("change", []); } });
</script>

<template>
  <div
    class="k-tag-input"
    :class="[
      rootClass,
      `k-tag-input--${size}`,
      {
        'k-tag-input--disabled': disabled,
        'k-tag-input--invalid': isInvalid
      }
    ]"
    :style="rootStyle"
  >
    <div class="k-tag-input__field" @mousedown.self="focus">
      <span
        v-for="(tag, index) in model"
        :key="`${tag}-${index}`"
        class="k-tag-input__tag"
      >
        <span :title="tag">{{ tag }}</span>
        <button
          type="button"
          :disabled="disabled"
          :aria-label="`移除 ${tag}`"
          @click="remove(index)"
        >×</button>
      </span>
      <input
        :id="inputId"
        ref="input"
        v-model="draft"
        class="k-tag-input__input"
        v-bind="inputAttrs"
        type="text"
        autocomplete="off"
        :disabled="disabled"
        :placeholder="model.length ? '' : placeholder"
        :aria-label="ariaLabel"
        :aria-invalid="isInvalid"
        :aria-describedby="message ? messageId : undefined"
        @keydown="handleKeydown"
        @paste="handlePaste"
        @blur="addOnBlur && commitDraft()"
      />
    </div>
    <input
      v-for="(tag, index) in model"
      :key="`form-${tag}-${index}`"
      type="hidden"
      :name="name"
      :value="tag"
    />
    <p v-if="message" :id="messageId" class="k-tag-input__message" role="alert">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.k-tag-input {
  --k-tag-min-height: 2.75rem;
  --k-tag-font-size: 0.78rem;
  width: 100%;
  min-width: 0;
  color: var(--k-color-text, #1d2725);
}
.k-tag-input--small { --k-tag-min-height: 2.3rem; --k-tag-font-size: 0.73rem; }
.k-tag-input--large { --k-tag-min-height: 3.2rem; --k-tag-font-size: 0.84rem; }
.k-tag-input__field {
  min-height: var(--k-tag-min-height);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.32rem;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.32));
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0.3rem 0.55rem;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  transition: border-color 160ms ease-out, box-shadow 180ms ease-out, background-color 160ms ease-out;
}
.k-tag-input__field:hover { border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.46)); }
.k-tag-input__field:focus-within { border-color: var(--k-color-primary, #257360); background: var(--k-color-control-surface-focus, rgba(255,255,255,.94)); box-shadow: 0 0 0 .22rem var(--k-color-focus-ring, rgba(37,115,96,.12)); }
.k-tag-input--invalid .k-tag-input__field { border-color: var(--k-color-danger, #b34a4a); }
.k-tag-input--invalid .k-tag-input__field:focus-within { box-shadow: 0 0 0 .22rem var(--k-color-danger-ring, rgba(179,74,74,.12)); }
.k-tag-input__tag { max-width: 12rem; min-height: 1.72rem; display: inline-flex; align-items: center; gap: .22rem; border-radius: .5rem; padding: .12rem .28rem .12rem .5rem; color: var(--k-color-primary, #257360); background: var(--k-color-primary-soft, rgba(37,115,96,.09)); font-size: .7rem; }
.k-tag-input__tag > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.k-tag-input__tag button { width: 1.35rem; height: 1.35rem; border: 0; border-radius: 50%; padding: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; touch-action: manipulation; transition: background-color 100ms ease-out, transform 80ms ease-out; }
.k-tag-input__tag button:hover:not(:disabled) { background: rgba(37,115,96,.11); }
.k-tag-input__tag button:active:not(:disabled) { transform: scale(.9); }
.k-tag-input__input { min-width: 7rem; height: 1.8rem; flex: 1; border: 0; padding: 0 .2rem; color: inherit; background: transparent; font: inherit; font-size: var(--k-tag-font-size); outline: 0; }
.k-tag-input__input::placeholder { color: var(--k-color-text-subtle, #929d99); }
.k-tag-input__message { margin: .35rem 0 0; color: var(--k-color-danger, #b34a4a); font-size: .7rem; line-height: 1.45; }
.k-tag-input--disabled { opacity: .58; }
.k-tag-input--disabled .k-tag-input__field { cursor: not-allowed; }
@media (max-width: 40rem) {
  .k-tag-input--small { --k-tag-min-height: 2.75rem; --k-tag-font-size: .8rem; }
  .k-tag-input__tag button { width: 1.6rem; height: 1.6rem; }
}
@media (prefers-reduced-motion: reduce) {
  .k-tag-input__field, .k-tag-input__tag button { transition: background-color 100ms ease-out, border-color 100ms ease-out; }
  .k-tag-input__tag button:active:not(:disabled) { transform: none; }
}
@media (prefers-reduced-transparency: reduce) { .k-tag-input__field { background: var(--k-color-surface, #fff); } }
@media (prefers-contrast: more) { .k-tag-input__field { border-color: currentColor; } }
</style>
