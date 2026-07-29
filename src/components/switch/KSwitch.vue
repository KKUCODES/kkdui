<script setup lang="ts">
import {
  computed,
  useAttrs,
  useId,
  type CSSProperties
} from "vue";
import type { KSwitchProps } from "./types";

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<KSwitchProps>(), {
  label: "",
  description: "",
  size: "medium",
  disabled: false,
  loading: false,
  invalid: false
});

const emit = defineEmits<{
  change: [checked: boolean, event: Event];
}>();

const model = defineModel<boolean>({ default: false });
const attrs = useAttrs();
const generatedId = useId();
const inputId = computed(() => props.id ?? `k-switch-${generatedId}`);
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

function handleChange(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  model.value = checked;
  emit("change", checked, event);
}
</script>

<template>
  <label
    class="k-switch"
    :class="[
      rootClass,
      `k-switch--${size}`,
      {
        'k-switch--disabled': disabled || loading,
        'k-switch--invalid': invalid
      }
    ]"
    :style="rootStyle"
  >
    <input
      :id="inputId"
      class="k-switch__native"
      v-bind="inputAttrs"
      type="checkbox"
      role="switch"
      :name="name"
      :checked="model"
      :disabled="disabled || loading"
      :aria-invalid="invalid"
      :aria-busy="loading"
      @change="handleChange"
    />
    <span class="k-switch__track" aria-hidden="true">
      <span class="k-switch__thumb">
        <span v-if="loading" class="k-switch__spinner"></span>
      </span>
    </span>
    <span
      v-if="label || description || $slots.default"
      class="k-switch__content"
    >
      <span class="k-switch__label">
        <slot>{{ label }}</slot>
      </span>
      <span v-if="description" class="k-switch__description">
        {{ description }}
      </span>
    </span>
  </label>
</template>

<style scoped>
.k-switch {
  --k-switch-width: 2.65rem;
  --k-switch-height: 1.55rem;
  --k-switch-thumb: 1.15rem;
  --k-switch-offset: 0.19rem;
  --k-switch-distance: 1.1rem;

  position: relative;
  min-height: 2.25rem;
  display: inline-flex;
  align-items: flex-start;
  gap: 0.7rem;
  border-radius: 0.8rem;
  color: var(--k-color-text, #1d2725);
  cursor: pointer;
  touch-action: manipulation;
}

.k-switch--small {
  --k-switch-width: 2.25rem;
  --k-switch-height: 1.3rem;
  --k-switch-thumb: 0.95rem;
  --k-switch-offset: 0.16rem;
  --k-switch-distance: 0.95rem;
}

.k-switch__native {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}

.k-switch__track {
  position: relative;
  width: var(--k-switch-width);
  height: var(--k-switch-height);
  flex: 0 0 auto;
  border: 1px solid rgba(90, 108, 102, 0.18);
  border-radius: 999px;
  margin-top: 0.04rem;
  background: rgba(111, 126, 121, 0.25);
  box-shadow: inset 0 0.08rem 0.18rem rgba(29, 39, 37, 0.14);
  transition:
    background-color 180ms ease-out,
    border-color 180ms ease-out,
    box-shadow 220ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-switch__thumb {
  position: absolute;
  top: var(--k-switch-offset);
  left: var(--k-switch-offset);
  width: var(--k-switch-thumb);
  height: var(--k-switch-thumb);
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0.15rem 0.35rem rgba(29, 39, 37, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateX(0);
  transition: transform 260ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-switch__native:checked + .k-switch__track {
  border-color: var(--k-color-primary, #257360);
  background: var(--k-color-primary, #257360);
  box-shadow:
    0 0.55rem 1rem -0.72rem rgba(24, 82, 68, 0.68),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.k-switch__native:checked + .k-switch__track .k-switch__thumb {
  transform: translateX(var(--k-switch-distance));
}

.k-switch__native:active + .k-switch__track .k-switch__thumb {
  transform: scale(0.9);
  transition-duration: 80ms;
}

.k-switch__native:checked:active + .k-switch__track .k-switch__thumb {
  transform: translateX(var(--k-switch-distance)) scale(0.9);
}

.k-switch__native:focus-visible + .k-switch__track {
  outline: 0.2rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.18rem;
}

.k-switch__content {
  min-width: 0;
  display: grid;
  gap: 0.16rem;
}

.k-switch__label {
  font-size: 0.8rem;
  font-weight: 570;
  line-height: 1.45;
}

.k-switch__description {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.7rem;
  line-height: 1.5;
}

.k-switch__spinner {
  width: 0.62rem;
  height: 0.62rem;
  border: 1.25px solid rgba(37, 115, 96, 0.3);
  border-right-color: var(--k-color-primary, #257360);
  border-radius: 50%;
  animation: k-switch-spin 700ms linear infinite;
}

.k-switch--invalid .k-switch__track {
  border-color: var(--k-color-danger, #b34a4a);
}

.k-switch--disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

@keyframes k-switch-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 40rem) {
  .k-switch {
    min-height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-switch__track,
  .k-switch__thumb {
    transition: background-color 100ms ease-out;
  }

  .k-switch__native:active + .k-switch__track .k-switch__thumb,
  .k-switch__native:checked:active + .k-switch__track .k-switch__thumb {
    transform: none;
  }

  .k-switch__native:checked + .k-switch__track .k-switch__thumb {
    transform: translateX(var(--k-switch-distance));
  }

  .k-switch__spinner {
    animation-duration: 1200ms;
  }
}

@media (prefers-contrast: more) {
  .k-switch__track {
    border-color: currentColor;
  }
}
</style>
