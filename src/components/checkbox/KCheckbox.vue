<script setup lang="ts">
import {
  computed,
  ref,
  useAttrs,
  useId,
  watch,
  type CSSProperties
} from "vue";
import { MinusIcon } from "../../icons";
import CheckboxCheckIcon from "../../icons/internal/CheckboxCheckIcon.vue";
import type { KCheckboxProps } from "./types";

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<KCheckboxProps>(), {
  label: "",
  description: "",
  disabled: false,
  indeterminate: false,
  invalid: false
});

const emit = defineEmits<{
  change: [checked: boolean, event: Event];
}>();

const model = defineModel<boolean>({ default: false });
const attrs = useAttrs();
const generatedId = useId();
const inputElement = ref<HTMLInputElement | null>(null);
const inputId = computed(() => props.id ?? `k-checkbox-${generatedId}`);
const rootClass = computed(() => attrs.class);
const rootStyle = computed(() => attrs.style as CSSProperties | undefined);
const inputAttrs = computed(() => {
  const {
    class: _className,
    style: _style,
    ...passthrough
  } = attrs;
  return passthrough;
});

watch(
  [() => props.indeterminate, inputElement],
  ([indeterminate, element]) => {
    if (element !== null) {
      element.indeterminate = indeterminate;
    }
  },
  {
    immediate: true,
    flush: "post"
  }
);

function handleChange(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  model.value = checked;
  emit("change", checked, event);
}
</script>

<template>
  <label
    class="k-checkbox"
    :class="[
      rootClass,
      {
        'k-checkbox--disabled': disabled,
        'k-checkbox--invalid': invalid
      }
    ]"
    :style="rootStyle"
  >
    <input
      :id="inputId"
      ref="inputElement"
      class="k-checkbox__native"
      v-bind="inputAttrs"
      type="checkbox"
      :name="name"
      :checked="model"
      :disabled="disabled"
      :aria-invalid="invalid"
      @change="handleChange"
    />
    <span class="k-checkbox__control" aria-hidden="true">
      <MinusIcon v-if="indeterminate" />
      <CheckboxCheckIcon v-else />
    </span>
    <span
      v-if="label || description || $slots.default"
      class="k-checkbox__content"
    >
      <span class="k-checkbox__label">
        <slot>{{ label }}</slot>
      </span>
      <span v-if="description" class="k-checkbox__description">
        {{ description }}
      </span>
    </span>
  </label>
</template>

<style scoped>
.k-checkbox {
  position: relative;
  min-height: 2.25rem;
  display: inline-flex;
  align-items: flex-start;
  gap: 0.65rem;
  border-radius: 0.7rem;
  color: var(--k-color-text, #1d2725);
  cursor: pointer;
  touch-action: manipulation;
}

.k-checkbox__native {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}

.k-checkbox__control {
  width: 1.15rem;
  height: 1.15rem;
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--k-color-border-hover, rgba(72, 94, 88, 0.42));
  border-radius: 0.34rem;
  margin-top: 0.12rem;
  color: var(--k-color-on-primary, #ffffff);
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transition:
    transform 100ms ease-out,
    border-color 170ms ease-out,
    background-color 170ms ease-out,
    box-shadow 180ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-checkbox__control svg {
  width: 0.8rem;
  height: 0.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  opacity: 0;
  transform: scale(0.75);
  transition:
    opacity 120ms ease-out,
    transform 190ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-checkbox__native:checked + .k-checkbox__control,
.k-checkbox__native:indeterminate + .k-checkbox__control {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-primary, #257360);
  box-shadow:
    0 0.45rem 0.9rem -0.65rem rgba(24, 82, 68, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.k-checkbox__native:checked + .k-checkbox__control svg,
.k-checkbox__native:indeterminate + .k-checkbox__control svg {
  opacity: 1;
  transform: scale(1);
}

.k-checkbox__native:active + .k-checkbox__control {
  transform: scale(0.9);
}

.k-checkbox__native:focus-visible + .k-checkbox__control {
  outline: 0.2rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.18rem;
}

.k-checkbox__content {
  min-width: 0;
  display: grid;
  gap: 0.16rem;
}

.k-checkbox__label {
  font-size: 0.8rem;
  font-weight: 570;
  line-height: 1.45;
}

.k-checkbox__description {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.7rem;
  line-height: 1.5;
}

.k-checkbox--invalid .k-checkbox__control {
  border-color: var(--k-color-danger, #b34a4a);
}

.k-checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 40rem) {
  .k-checkbox {
    min-height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-checkbox__control,
  .k-checkbox__control svg {
    transition: opacity 100ms ease-out, background-color 100ms ease-out;
  }

  .k-checkbox__native:active + .k-checkbox__control {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-checkbox__control {
    background: var(--k-color-surface, #ffffff);
  }
}

@media (prefers-contrast: more) {
  .k-checkbox__control {
    border-color: currentColor;
  }
}
</style>
