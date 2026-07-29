<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  watch,
  type CSSProperties
} from "vue";
import { CheckIcon, ChevronDownIcon } from "../../icons";
import SearchSmallIcon from "../../icons/internal/SearchSmallIcon.vue";
import type {
  KComboboxOption,
  KComboboxProps,
  KComboboxValue
} from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<KComboboxProps>(), {
  placeholder: "请选择",
  size: "medium",
  disabled: false,
  invalid: false,
  clearable: false,
  loading: false,
  remote: false,
  remoteDebounce: 250,
  noResultText: "暂无匹配结果",
  loadingText: "正在加载…",
  ariaLabel: "搜索并选择"
});

const emit = defineEmits<{
  change: [value: KComboboxValue | null];
  clear: [];
  search: [query: string];
  loadError: [error: unknown];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const model = defineModel<KComboboxValue | null>({ default: null });
const attrs = useAttrs();
const generatedId = useId();
const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref("");
const activeIndex = ref(-1);
const internalLoading = ref(false);
const remoteOptions = ref<readonly KComboboxOption[]>(props.options);
const lastSelectedOption = ref<KComboboxOption | null>(
  props.options.find((option) => option.value === model.value) ?? null
);
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let requestSequence = 0;

const inputId = computed(() => props.id ?? `k-combobox-${generatedId}`);
const listboxId = computed(() => `${inputId.value}-listbox`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const sourceOptions = computed(() => props.remote ? remoteOptions.value : props.options);
const selectedOption = computed(() => {
  const current = [...sourceOptions.value, ...props.options].find(
    (option) => option.value === model.value
  );
  if (current) return current;
  return lastSelectedOption.value?.value === model.value ? lastSelectedOption.value : undefined;
});
const visibleOptions = computed(() => {
  if (props.remote || query.value.trim() === "") return sourceOptions.value;
  const keyword = query.value.trim().toLocaleLowerCase();
  return sourceOptions.value.filter((option) =>
    `${option.label} ${option.description ?? ""}`.toLocaleLowerCase().includes(keyword)
  );
});
const busy = computed(() => props.loading || internalLoading.value);
const displayValue = computed(() =>
  open.value ? query.value : selectedOption.value?.label ?? ""
);
const activeDescendant = computed(() =>
  activeIndex.value >= 0 ? `${listboxId.value}-option-${activeIndex.value}` : undefined
);

function openList(): void {
  if (props.disabled) return;
  open.value = true;
  query.value = "";
  activeIndex.value = visibleOptions.value.findIndex((option) => !option.disabled);
  if (props.remote) runRemoteSearch("");
}

function closeList(): void {
  open.value = false;
  query.value = "";
  activeIndex.value = -1;
}

function select(option: KComboboxOption): void {
  if (props.disabled || option.disabled) return;
  model.value = option.value;
  lastSelectedOption.value = option;
  emit("change", option.value);
  closeList();
  void nextTick(() => input.value?.focus({ preventScroll: true }));
}

function clear(): void {
  if (props.disabled || model.value === null) return;
  model.value = null;
  emit("change", null);
  emit("clear");
  query.value = "";
  input.value?.focus({ preventScroll: true });
}

async function performRemoteSearch(searchQuery: string, sequence: number): Promise<void> {
  internalLoading.value = true;
  try {
    const result = await props.remoteMethod?.(searchQuery);
    if (sequence === requestSequence && result !== undefined) remoteOptions.value = result;
  } catch (error) {
    if (sequence === requestSequence) remoteOptions.value = [];
    emit("loadError", error);
  } finally {
    if (sequence === requestSequence) internalLoading.value = false;
  }
}

function runRemoteSearch(searchQuery: string): void {
  emit("search", searchQuery);
  if (!props.remoteMethod) return;
  const sequence = ++requestSequence;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(
    () => void performRemoteSearch(searchQuery, sequence),
    props.remoteDebounce
  );
}

function handleInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value;
  open.value = true;
  activeIndex.value = -1;
  if (props.remote) runRemoteSearch(query.value);
  else emit("search", query.value);
}

function moveActive(direction: 1 | -1): void {
  const enabled = visibleOptions.value
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled);
  if (enabled.length === 0) return;
  const position = enabled.findIndex(({ index }) => index === activeIndex.value);
  const nextPosition = (Math.max(0, position) + direction + enabled.length) % enabled.length;
  activeIndex.value = enabled[nextPosition]!.index;
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) openList();
    else moveActive(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Enter" && open.value && activeIndex.value >= 0) {
    event.preventDefault();
    const option = visibleOptions.value[activeIndex.value];
    if (option) select(option);
  } else if (event.key === "Escape" && open.value) {
    event.preventDefault();
    closeList();
  } else if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = visibleOptions.value.findIndex((option) => !option.disabled);
  } else if (event.key === "End" && open.value) {
    event.preventDefault();
    for (let index = visibleOptions.value.length - 1; index >= 0; index -= 1) {
      if (!visibleOptions.value[index]!.disabled) {
        activeIndex.value = index;
        break;
      }
    }
  }
}

function handleDocumentPointer(event: MouseEvent): void {
  if (root.value && !root.value.contains(event.target as Node)) closeList();
}

watch(
  () => props.options,
  (options) => {
    if (props.remote) remoteOptions.value = options;
  }
);
watch(
  () => model.value,
  (value) => {
    if (value === null) lastSelectedOption.value = null;
    else {
      const option = [...sourceOptions.value, ...props.options].find(
        (candidate) => candidate.value === value
      );
      if (option) lastSelectedOption.value = option;
    }
  }
);
watch(visibleOptions, (options) => {
  if (activeIndex.value >= options.length) activeIndex.value = -1;
});
onMounted(() => document.addEventListener("mousedown", handleDocumentPointer));
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleDocumentPointer);
  clearTimeout(debounceTimer);
});

defineExpose({ focus: () => input.value?.focus(), clear, open: openList, close: closeList });
</script>

<template>
  <div
    ref="root"
    class="k-combobox"
    :class="[
      rootClass,
      `k-combobox--${size}`,
      {
        'k-combobox--open': open,
        'k-combobox--disabled': disabled,
        'k-combobox--invalid': invalid
      }
    ]"
    :style="rootStyle"
  >
    <div class="k-combobox__field">
      <SearchSmallIcon class="k-combobox__search" />
      <input
        :id="inputId"
        ref="input"
        class="k-combobox__input"
        v-bind="inputAttrs"
        role="combobox"
        type="text"
        autocomplete="off"
        :name="name"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel"
        :aria-expanded="open"
        aria-autocomplete="list"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendant"
        :aria-invalid="invalid"
        :aria-busy="busy"
        @focus="openList(); emit('focus', $event)"
        @click="!open && openList()"
        @blur="emit('blur', $event)"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <button
        v-if="clearable && model !== null"
        class="k-combobox__clear"
        type="button"
        :disabled="disabled"
        aria-label="清除选择"
        @mousedown.prevent
        @click="clear"
      >×</button>
      <ChevronDownIcon class="k-combobox__chevron" />
    </div>
    <div
      v-if="open"
      :id="listboxId"
      class="k-combobox__menu"
      role="listbox"
      :aria-label="ariaLabel"
    >
      <div v-if="busy" class="k-combobox__state" role="status">
        <span class="k-combobox__spinner" aria-hidden="true" />{{ loadingText }}
      </div>
      <template v-else-if="visibleOptions.length">
        <button
          v-for="(option, index) in visibleOptions"
          :id="`${listboxId}-option-${index}`"
          :key="`${typeof option.value}-${option.value}`"
          class="k-combobox__option"
          :class="{ 'k-combobox__option--active': index === activeIndex }"
          type="button"
          role="option"
          :aria-selected="model === option.value"
          :disabled="option.disabled"
          @mouseenter="activeIndex = index"
          @mousedown.prevent
          @click="select(option)"
        >
          <span>{{ option.label }}</span>
          <small v-if="option.description">{{ option.description }}</small>
          <CheckIcon v-if="model === option.value" />
        </button>
      </template>
      <div v-else class="k-combobox__state">
        <slot name="empty" :query="query">{{ noResultText }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.k-combobox {
  --k-combobox-height: 2.75rem;
  --k-combobox-font-size: 0.82rem;
  position: relative;
  width: 100%;
  min-width: 0;
  color: var(--k-color-text, #1d2725);
}
.k-combobox--small { --k-combobox-height: 2.3rem; --k-combobox-font-size: 0.76rem; }
.k-combobox--large { --k-combobox-height: 3.2rem; --k-combobox-font-size: 0.88rem; }
.k-combobox__field {
  height: var(--k-combobox-height);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.32));
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0 0.75rem;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  transition: border-color 160ms ease-out, box-shadow 180ms ease-out, background-color 160ms ease-out;
}
.k-combobox__field:hover { border-color: var(--k-color-border-hover, rgba(72, 94, 88, 0.46)); }
.k-combobox--open .k-combobox__field {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-control-surface-focus, rgba(255, 255, 255, 0.94));
  box-shadow: 0 0 0 0.22rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.12));
}
.k-combobox--invalid .k-combobox__field { border-color: var(--k-color-danger, #b34a4a); }
.k-combobox__input { min-width: 0; height: 100%; flex: 1; border: 0; padding: 0; color: inherit; background: transparent; font: inherit; font-size: var(--k-combobox-font-size); outline: 0; }
.k-combobox__input::placeholder { color: var(--k-color-text-subtle, #929d99); }
.k-combobox__search, .k-combobox__chevron { width: 0.9rem; height: 0.9rem; flex: 0 0 auto; fill: none; stroke: var(--k-color-text-muted, #65706d); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; pointer-events: none; }
.k-combobox__chevron { transition: transform 180ms ease-out; }
.k-combobox--open .k-combobox__chevron { transform: rotate(180deg); }
.k-combobox__clear { width: 1.7rem; height: 1.7rem; border: 0; border-radius: 50%; padding: 0; color: var(--k-color-text-muted, #65706d); background: transparent; font: inherit; cursor: pointer; }
.k-combobox__clear:hover { background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07)); }
.k-combobox__menu {
  position: absolute;
  z-index: 30;
  top: calc(100% + 0.4rem);
  right: 0;
  left: 0;
  max-height: 17rem;
  overflow: auto;
  border: 1px solid var(--k-color-border, rgba(114, 131, 126, 0.24));
  border-radius: 0.8rem;
  padding: 0.28rem;
  background: var(--k-color-surface, #fff);
  box-shadow: 0 0.8rem 2.2rem rgba(23, 48, 41, 0.14);
}
.k-combobox__option { width: 100%; min-height: 2.45rem; display: grid; grid-template-columns: 1fr auto; gap: 0.12rem 0.5rem; align-items: center; border: 0; border-radius: 0.58rem; padding: 0.5rem 0.65rem; color: inherit; background: transparent; font: inherit; font-size: 0.78rem; text-align: left; cursor: pointer; }
.k-combobox__option--active { background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07)); }
.k-combobox__option small { grid-column: 1; color: var(--k-color-text-muted, #65706d); font-size: 0.68rem; }
.k-combobox__option svg { grid-column: 2; grid-row: 1 / span 2; width: 0.85rem; height: 0.85rem; fill: none; stroke: var(--k-color-primary, #257360); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2; }
.k-combobox__option:disabled { cursor: not-allowed; opacity: 0.45; }
.k-combobox__state { min-height: 4rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--k-color-text-muted, #65706d); font-size: 0.74rem; }
.k-combobox__spinner { width: 0.85rem; height: 0.85rem; border: 2px solid rgba(37, 115, 96, 0.2); border-top-color: var(--k-color-primary, #257360); border-radius: 50%; animation: k-combobox-spin 700ms linear infinite; }
.k-combobox--disabled { opacity: 0.58; }
.k-combobox--disabled .k-combobox__field { cursor: not-allowed; }
@keyframes k-combobox-spin { to { transform: rotate(1turn); } }
@media (max-width: 40rem) {
  .k-combobox--small { --k-combobox-height: 2.75rem; --k-combobox-font-size: 0.82rem; }
  .k-combobox__option { min-height: 2.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .k-combobox__field, .k-combobox__chevron { transition: background-color 100ms ease-out, border-color 100ms ease-out; }
  .k-combobox__chevron { transform: none !important; }
  .k-combobox__spinner { animation-duration: 1.4s; }
}
@media (prefers-reduced-transparency: reduce) { .k-combobox__field { background: var(--k-color-surface, #fff); } }
@media (prefers-contrast: more) { .k-combobox__field, .k-combobox__menu { border-color: currentColor; } }
</style>
