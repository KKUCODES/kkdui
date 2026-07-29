<script setup lang="ts">
import { computed, useId } from "vue";
import type { KRadioGroupProps, KRadioValue } from "./types";

const props = withDefaults(defineProps<KRadioGroupProps>(), {
  direction: "horizontal",
  size: "medium",
  disabled: false,
  invalid: false,
  ariaLabel: "单选"
});

const emit = defineEmits<{
  change: [value: KRadioValue, event: Event];
}>();

const model = defineModel<KRadioValue | null>({ default: null });
const generatedId = useId();
const groupId = computed(() => props.id ?? `k-radio-group-${generatedId}`);
const groupName = computed(() => props.name ?? groupId.value);

function optionId(index: number): string {
  return `${groupId.value}-option-${index}`;
}

function handleChange(optionValue: KRadioValue, event: Event): void {
  model.value = optionValue;
  emit("change", optionValue, event);
}
</script>

<template>
  <div
    :id="groupId"
    class="k-radio-group"
    :class="[
      `k-radio-group--${direction}`,
      `k-radio-group--${size}`,
      {
        'k-radio-group--disabled': disabled,
        'k-radio-group--invalid': invalid
      }
    ]"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-invalid="invalid"
    :aria-disabled="disabled"
  >
    <label
      v-for="(option, index) in options"
      :key="`${typeof option.value}-${option.value}`"
      class="k-radio-group__option"
      :class="{ 'k-radio-group__option--disabled': disabled || option.disabled }"
      :for="optionId(index)"
    >
      <input
        :id="optionId(index)"
        class="k-radio-group__native"
        type="radio"
        :name="groupName"
        :value="String(option.value)"
        :checked="model === option.value"
        :disabled="disabled || option.disabled"
        @change="handleChange(option.value, $event)"
      />
      <span class="k-radio-group__control" aria-hidden="true"><span /></span>
      <span class="k-radio-group__content">
        <span class="k-radio-group__label">{{ option.label }}</span>
        <span v-if="option.description" class="k-radio-group__description">
          {{ option.description }}
        </span>
      </span>
    </label>
  </div>
</template>

<style scoped>
.k-radio-group {
  --k-radio-size: 1.08rem;
  --k-radio-label-size: 0.8rem;
  display: flex;
  gap: 0.65rem 1rem;
  color: var(--k-color-text, #1d2725);
}
.k-radio-group--small { --k-radio-size: 1rem; --k-radio-label-size: 0.75rem; }
.k-radio-group--large { --k-radio-size: 1.18rem; --k-radio-label-size: 0.86rem; }
.k-radio-group--horizontal { flex-flow: row wrap; }
.k-radio-group--vertical { flex-direction: column; align-items: flex-start; }
.k-radio-group__option {
  position: relative;
  min-height: 2.25rem;
  display: inline-flex;
  align-items: flex-start;
  gap: 0.6rem;
  border-radius: 0.68rem;
  cursor: pointer;
  touch-action: manipulation;
}
.k-radio-group__native {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.k-radio-group__control {
  width: var(--k-radio-size);
  height: var(--k-radio-size);
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--k-color-border-hover, rgba(72, 94, 88, 0.46));
  border-radius: 50%;
  margin-top: 0.12rem;
  background: var(--k-color-control-surface, rgba(255, 255, 255, 0.72));
  transition: border-color 150ms ease-out, box-shadow 170ms ease-out, transform 90ms ease-out;
}
.k-radio-group__control span {
  width: 52%;
  height: 52%;
  border-radius: 50%;
  background: var(--k-color-primary, #257360);
  opacity: 0;
  transform: scale(0.35);
  transition: opacity 120ms ease-out, transform 190ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}
.k-radio-group__native:checked + .k-radio-group__control { border-color: var(--k-color-primary, #257360); }
.k-radio-group__native:checked + .k-radio-group__control span { opacity: 1; transform: scale(1); }
.k-radio-group__native:focus-visible + .k-radio-group__control {
  outline: 0.2rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.16rem;
}
.k-radio-group__native:active + .k-radio-group__control { transform: scale(0.9); }
.k-radio-group__content { display: grid; gap: 0.12rem; min-width: 0; }
.k-radio-group__label { font-size: var(--k-radio-label-size); font-weight: 570; line-height: 1.45; }
.k-radio-group__description { color: var(--k-color-text-muted, #65706d); font-size: 0.7rem; line-height: 1.5; }
.k-radio-group--invalid .k-radio-group__control { border-color: var(--k-color-danger, #b34a4a); }
.k-radio-group__option--disabled { cursor: not-allowed; opacity: 0.5; }
@media (max-width: 40rem) {
  .k-radio-group__option { min-height: 2.75rem; }
  .k-radio-group--small { --k-radio-size: 1.08rem; --k-radio-label-size: 0.8rem; }
}
@media (prefers-reduced-motion: reduce) {
  .k-radio-group__control, .k-radio-group__control span { transition: opacity 100ms ease-out, border-color 100ms ease-out; }
  .k-radio-group__native:active + .k-radio-group__control { transform: none; }
}
@media (prefers-reduced-transparency: reduce) { .k-radio-group__control { background: var(--k-color-surface, #fff); } }
@media (prefers-contrast: more) { .k-radio-group__control { border-color: currentColor; } }
</style>
