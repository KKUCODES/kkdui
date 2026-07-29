<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  type CSSProperties
} from "vue";
import type {
  KMultiSelectOption,
  KMultiSelectProps,
  KMultiSelectValue
} from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<KMultiSelectProps>(), {
  placeholder: "请选择",
  size: "medium",
  disabled: false,
  invalid: false,
  clearable: true,
  filterable: true,
  collapseTags: true,
  maxTagCount: 2,
  noResultText: "暂无匹配结果",
  ariaLabel: "多选"
});

const emit = defineEmits<{
  change: [value: KMultiSelectValue[]];
  clear: [];
  search: [query: string];
}>();

const model = defineModel<KMultiSelectValue[]>({ default: () => [] });
const attrs = useAttrs();
const generatedId = useId();
const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref("");
const activeIndex = ref(-1);
const inputId = computed(() => props.id ?? `k-multi-select-${generatedId}`);
const listboxId = computed(() => `${inputId.value}-listbox`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const selectedOptions = computed(() =>
  model.value
    .map((value) => props.options.find((option) => option.value === value))
    .filter((option): option is KMultiSelectOption => option !== undefined)
);
const visibleTags = computed(() =>
  props.collapseTags
    ? selectedOptions.value.slice(0, Math.max(0, props.maxTagCount))
    : selectedOptions.value
);
const collapsedCount = computed(() =>
  Math.max(0, selectedOptions.value.length - visibleTags.value.length)
);
const filteredOptions = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase();
  if (!keyword) return props.options;
  return props.options.filter((option) =>
    `${option.label} ${option.description ?? ""}`.toLocaleLowerCase().includes(keyword)
  );
});
const activeDescendant = computed(() =>
  activeIndex.value >= 0 ? `${listboxId.value}-option-${activeIndex.value}` : undefined
);

function isSelected(value: KMultiSelectValue): boolean {
  return model.value.includes(value);
}

function openList(): void {
  if (props.disabled) return;
  open.value = true;
  activeIndex.value = filteredOptions.value.findIndex((option) => !option.disabled);
}

function closeList(): void {
  open.value = false;
  query.value = "";
  activeIndex.value = -1;
}

function toggle(option: KMultiSelectOption): void {
  if (props.disabled || option.disabled) return;
  const next = isSelected(option.value)
    ? model.value.filter((value) => value !== option.value)
    : [...model.value, option.value];
  model.value = next;
  emit("change", next);
  void nextTick(() => input.value?.focus({ preventScroll: true }));
}

function remove(option: KMultiSelectOption): void {
  if (props.disabled) return;
  const next = model.value.filter((value) => value !== option.value);
  model.value = next;
  emit("change", next);
}

function clear(): void {
  if (props.disabled || model.value.length === 0) return;
  model.value = [];
  query.value = "";
  emit("change", []);
  emit("clear");
  input.value?.focus({ preventScroll: true });
}

function handleInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value;
  openList();
  activeIndex.value = filteredOptions.value.findIndex((option) => !option.disabled);
  emit("search", query.value);
}

function moveActive(direction: 1 | -1): void {
  const available = filteredOptions.value
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled);
  if (!available.length) return;
  const position = available.findIndex(({ index }) => index === activeIndex.value);
  activeIndex.value =
    available[(Math.max(0, position) + direction + available.length) % available.length]!.index;
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) openList();
    else moveActive(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Enter" && open.value && activeIndex.value >= 0) {
    event.preventDefault();
    const option = filteredOptions.value[activeIndex.value];
    if (option) toggle(option);
  } else if (event.key === "Escape" && open.value) {
    event.preventDefault();
    closeList();
  } else if (event.key === "Backspace" && query.value === "" && selectedOptions.value.length) {
    remove(selectedOptions.value.at(-1)!);
  }
}

function handleDocumentPointer(event: MouseEvent): void {
  if (root.value && !root.value.contains(event.target as Node)) closeList();
}

onMounted(() => document.addEventListener("mousedown", handleDocumentPointer));
onBeforeUnmount(() => document.removeEventListener("mousedown", handleDocumentPointer));
defineExpose({ focus: () => input.value?.focus(), clear, open: openList, close: closeList });
</script>

<template>
  <div
    ref="root"
    class="k-multi-select"
    :class="[
      rootClass,
      `k-multi-select--${size}`,
      {
        'k-multi-select--open': open,
        'k-multi-select--disabled': disabled,
        'k-multi-select--invalid': invalid
      }
    ]"
    :style="rootStyle"
  >
    <div class="k-multi-select__field" @mousedown.self="input?.focus()">
      <span
        v-for="option in visibleTags"
        :key="`${typeof option.value}-${option.value}`"
        class="k-multi-select__tag"
      >
        <span>{{ option.label }}</span>
        <button
          type="button"
          :aria-label="`移除 ${option.label}`"
          :disabled="disabled"
          @mousedown.prevent
          @click="remove(option)"
        >×</button>
      </span>
      <span
        v-if="collapsedCount"
        class="k-multi-select__tag k-multi-select__tag--count"
        :title="selectedOptions.slice(visibleTags.length).map((option) => option.label).join('、')"
      >
        +{{ collapsedCount }}
      </span>
      <input
        :id="inputId"
        ref="input"
        class="k-multi-select__input"
        v-bind="inputAttrs"
        role="combobox"
        type="text"
        autocomplete="off"
        :value="query"
        :readonly="!filterable"
        :disabled="disabled"
        :placeholder="selectedOptions.length ? '' : placeholder"
        :aria-label="ariaLabel"
        :aria-expanded="open"
        aria-autocomplete="list"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendant"
        :aria-invalid="invalid"
        @focus="openList"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <button
        v-if="clearable && model.length"
        class="k-multi-select__clear"
        type="button"
        :disabled="disabled"
        aria-label="清除全部选择"
        @mousedown.prevent
        @click="clear"
      >×</button>
      <svg class="k-multi-select__chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
    </div>
    <input
      v-for="value in model"
      :key="`form-${typeof value}-${value}`"
      type="hidden"
      :name="name"
      :value="String(value)"
    />
    <div
      v-if="open"
      :id="listboxId"
      class="k-multi-select__menu"
      role="listbox"
      aria-multiselectable="true"
      :aria-label="ariaLabel"
    >
      <button
        v-for="(option, index) in filteredOptions"
        :id="`${listboxId}-option-${index}`"
        :key="`${typeof option.value}-${option.value}`"
        class="k-multi-select__option"
        :class="{ 'k-multi-select__option--active': index === activeIndex }"
        type="button"
        role="option"
        :disabled="option.disabled"
        :aria-selected="isSelected(option.value)"
        @mouseenter="activeIndex = index"
        @mousedown.prevent
        @click="toggle(option)"
      >
        <span class="k-multi-select__check" aria-hidden="true">
          <svg v-if="isSelected(option.value)" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" /></svg>
        </span>
        <span class="k-multi-select__option-content">
          <span>{{ option.label }}</span>
          <small v-if="option.description">{{ option.description }}</small>
        </span>
      </button>
      <div v-if="!filteredOptions.length" class="k-multi-select__empty">
        <slot name="empty" :query="query">{{ noResultText }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.k-multi-select {
  --k-multi-min-height: 2.75rem;
  --k-multi-font-size: 0.78rem;
  position: relative;
  width: 100%;
  min-width: 0;
  color: var(--k-color-text, #1d2725);
}
.k-multi-select--small { --k-multi-min-height: 2.3rem; --k-multi-font-size: 0.73rem; }
.k-multi-select--large { --k-multi-min-height: 3.2rem; --k-multi-font-size: 0.84rem; }
.k-multi-select__field {
  min-height: var(--k-multi-min-height);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.32));
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0.28rem 0.65rem;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  transition: border-color 160ms ease-out, box-shadow 180ms ease-out, background-color 160ms ease-out;
}
.k-multi-select--open .k-multi-select__field { border-color: var(--k-color-primary, #257360); background: var(--k-color-control-surface-focus, rgba(255,255,255,.94)); box-shadow: 0 0 0 .22rem var(--k-color-focus-ring, rgba(37,115,96,.12)); }
.k-multi-select--invalid .k-multi-select__field { border-color: var(--k-color-danger, #b34a4a); }
.k-multi-select__tag { max-width: 9rem; min-height: 1.7rem; display: inline-flex; align-items: center; gap: 0.22rem; border-radius: 0.5rem; padding: 0.12rem 0.3rem 0.12rem 0.5rem; color: var(--k-color-primary, #257360); background: var(--k-color-primary-soft, rgba(37,115,96,.09)); font-size: 0.7rem; }
.k-multi-select__tag > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.k-multi-select__tag button, .k-multi-select__clear { width: 1.35rem; height: 1.35rem; border: 0; border-radius: 50%; padding: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }
.k-multi-select__tag button:hover, .k-multi-select__clear:hover { background: rgba(37,115,96,.1); }
.k-multi-select__tag--count { padding-right: 0.5rem; color: var(--k-color-text-muted, #65706d); }
.k-multi-select__input { min-width: 4.5rem; height: 1.8rem; flex: 1; border: 0; padding: 0 .15rem; color: inherit; background: transparent; font: inherit; font-size: var(--k-multi-font-size); outline: 0; }
.k-multi-select__input::placeholder { color: var(--k-color-text-subtle, #929d99); }
.k-multi-select__clear { flex: 0 0 auto; color: var(--k-color-text-muted, #65706d); }
.k-multi-select__chevron { width: .85rem; height: .85rem; flex: 0 0 auto; fill: none; stroke: var(--k-color-text-muted, #65706d); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; transition: transform 180ms ease-out; }
.k-multi-select--open .k-multi-select__chevron { transform: rotate(180deg); }
.k-multi-select__menu { position: absolute; z-index: 30; top: calc(100% + .4rem); right: 0; left: 0; max-height: 17rem; overflow: auto; border: 1px solid var(--k-color-border, rgba(114,131,126,.24)); border-radius: .8rem; padding: .28rem; background: var(--k-color-surface, #fff); box-shadow: 0 .8rem 2.2rem rgba(23,48,41,.14); }
.k-multi-select__option { width: 100%; min-height: 2.5rem; display: flex; align-items: center; gap: .6rem; border: 0; border-radius: .58rem; padding: .45rem .6rem; color: inherit; background: transparent; font: inherit; font-size: .78rem; text-align: left; cursor: pointer; }
.k-multi-select__option--active { background: var(--k-color-surface-hover, rgba(37,115,96,.07)); }
.k-multi-select__option:disabled { cursor: not-allowed; opacity: .45; }
.k-multi-select__check { width: 1rem; height: 1rem; display: grid; flex: 0 0 auto; place-items: center; border: 1px solid var(--k-color-border-hover, rgba(72,94,88,.42)); border-radius: .3rem; }
.k-multi-select__check svg { width: .75rem; height: .75rem; fill: none; stroke: var(--k-color-primary, #257360); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2; }
.k-multi-select__option-content { display: grid; gap: .1rem; }
.k-multi-select__option-content small { color: var(--k-color-text-muted, #65706d); font-size: .68rem; }
.k-multi-select__empty { min-height: 4rem; display: grid; place-items: center; color: var(--k-color-text-muted, #65706d); font-size: .74rem; }
.k-multi-select--disabled { opacity: .58; }
@media (max-width: 40rem) {
  .k-multi-select--small { --k-multi-min-height: 2.75rem; --k-multi-font-size: .8rem; }
  .k-multi-select__option { min-height: 2.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .k-multi-select__field, .k-multi-select__chevron { transition: background-color 100ms ease-out, border-color 100ms ease-out; }
  .k-multi-select__chevron { transform: none !important; }
}
@media (prefers-reduced-transparency: reduce) { .k-multi-select__field { background: var(--k-color-surface, #fff); } }
@media (prefers-contrast: more) { .k-multi-select__field, .k-multi-select__menu { border-color: currentColor; } }
</style>
