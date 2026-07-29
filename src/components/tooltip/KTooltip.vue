<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useSlots,
  useId,
  watch,
  type CSSProperties
} from "vue";
import type {
  KTooltipPlacement,
  KTooltipProps
} from "./types";

const props = withDefaults(defineProps<KTooltipProps>(), {
  content: "",
  placement: "auto",
  disabled: false,
  openDelay: 320,
  closeDelay: 80,
  maxWidth: "18rem",
  teleportTo: "body"
});

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const open = defineModel<boolean>("open", { default: false });
const slots = useSlots();
const triggerElement = ref<HTMLElement | null>(null);
const tooltipElement = ref<HTMLElement | null>(null);
const tooltipId = `k-tooltip-${useId()}`;
const position = ref({
  top: 0,
  left: 0,
  placement: "top" as Exclude<KTooltipPlacement, "auto">
});
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

const tooltipStyle = computed<CSSProperties>(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  maxWidth:
    typeof props.maxWidth === "number"
      ? `${props.maxWidth}px`
      : props.maxWidth,
  transformOrigin: {
    top: "bottom center",
    bottom: "top center",
    left: "center right",
    right: "center left"
  }[position.value.placement]
}));

function clearTimers(): void {
  if (openTimer !== undefined) {
    clearTimeout(openTimer);
    openTimer = undefined;
  }
  if (closeTimer !== undefined) {
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }
}

function resolvePlacement(
  trigger: DOMRect,
  tooltip: DOMRect
): Exclude<KTooltipPlacement, "auto"> {
  if (props.placement !== "auto") {
    return props.placement;
  }
  const gap = 8;
  const spaces = {
    top: trigger.top,
    bottom: window.innerHeight - trigger.bottom,
    left: trigger.left,
    right: window.innerWidth - trigger.right
  };
  if (spaces.top >= tooltip.height + gap) {
    return "top";
  }
  if (spaces.bottom >= tooltip.height + gap) {
    return "bottom";
  }
  return spaces.right >= spaces.left ? "right" : "left";
}

function updatePosition(): void {
  const trigger = triggerElement.value;
  const tooltip = tooltipElement.value;
  if (trigger === null || tooltip === null) {
    return;
  }
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const placement = resolvePlacement(triggerRect, tooltipRect);
  const gap = 7;
  const padding = 6;
  let top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
  let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

  if (placement === "top") {
    top = triggerRect.top - tooltipRect.height - gap;
  } else if (placement === "bottom") {
    top = triggerRect.bottom + gap;
  } else if (placement === "left") {
    left = triggerRect.left - tooltipRect.width - gap;
  } else {
    left = triggerRect.right + gap;
  }

  position.value = {
    top: Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipRect.height - padding)
    ),
    left: Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipRect.width - padding)
    ),
    placement
  };
}

function show(immediate = false): void {
  if (props.disabled || (!props.content && slots.content === undefined)) {
    return;
  }
  clearTimers();
  const commit = () => {
    if (!open.value) {
      open.value = true;
      emit("open");
    }
  };
  if (immediate || props.openDelay <= 0) {
    commit();
  } else {
    openTimer = setTimeout(commit, props.openDelay);
  }
}

function hide(immediate = false): void {
  clearTimers();
  const commit = () => {
    if (open.value) {
      open.value = false;
      emit("close");
    }
  };
  if (immediate || props.closeDelay <= 0) {
    commit();
  } else {
    closeTimer = setTimeout(commit, props.closeDelay);
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    hide(true);
  }
}

function addGlobalListeners(): void {
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
  document.addEventListener("keydown", handleKeydown);
}

function removeGlobalListeners(): void {
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
  document.removeEventListener("keydown", handleKeydown);
}

watch(open, async (isOpen) => {
  if (isOpen) {
    addGlobalListeners();
    await nextTick();
    updatePosition();
  } else {
    removeGlobalListeners();
  }
}, {
  immediate: true,
  flush: "post"
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      hide(true);
    }
  }
);

onBeforeUnmount(() => {
  clearTimers();
  removeGlobalListeners();
});
</script>

<template>
  <span
    ref="triggerElement"
    class="k-tooltip__trigger"
    :tabindex="disabled ? -1 : 0"
    :aria-describedby="open ? tooltipId : undefined"
    @pointerenter="show()"
    @pointerleave="hide()"
    @focusin="show(true)"
    @focusout="hide(true)"
    @keydown="handleKeydown"
  >
    <slot></slot>
  </span>

  <Teleport :to="teleportTo">
    <Transition name="k-tooltip-fade">
      <span
        v-if="open && !disabled"
        :id="tooltipId"
        ref="tooltipElement"
        class="k-tooltip"
        :class="`k-tooltip--${position.placement}`"
        :style="tooltipStyle"
        role="tooltip"
      >
        <slot name="content">{{ content }}</slot>
      </span>
    </Transition>
  </Teleport>
</template>

<style scoped>
.k-tooltip__trigger {
  display: inline-flex;
  min-width: 0;
  border-radius: 0.3rem;
}

.k-tooltip__trigger:focus-visible {
  outline: 0.16rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

.k-tooltip {
  position: fixed;
  z-index: var(--k-z-tooltip, 1060);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 0.48rem;
  padding: 0.36rem 0.52rem;
  color: #f8fbfa;
  background: rgba(29, 39, 37, 0.94);
  -webkit-backdrop-filter: blur(0.8rem) saturate(130%);
  backdrop-filter: blur(0.8rem) saturate(130%);
  box-shadow: 0 0.7rem 1.8rem -0.9rem rgba(11, 24, 20, 0.58);
  font-size: 0.65rem;
  font-weight: 520;
  line-height: 1.45;
  overflow-wrap: anywhere;
  pointer-events: none;
}

.k-tooltip-fade-enter-active,
.k-tooltip-fade-leave-active {
  transition:
    opacity 120ms ease-out,
    transform 160ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-tooltip-fade-enter-from,
.k-tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .k-tooltip-fade-enter-active,
  .k-tooltip-fade-leave-active {
    transition: opacity 100ms ease-out;
  }

  .k-tooltip-fade-enter-from,
  .k-tooltip-fade-leave-to {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-tooltip {
    background: #1d2725;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-tooltip {
    border-color: #fff;
  }
}
</style>
