<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useId,
  watch,
  type CSSProperties
} from "vue";
import type {
  KPopoverPlacement,
  KPopoverProps
} from "./types";

const props = withDefaults(defineProps<KPopoverProps>(), {
  title: "",
  description: "",
  placement: "auto",
  align: "center",
  width: "18rem",
  disabled: false,
  showClose: false,
  closeOnEscape: true,
  closeOnOutside: true,
  initialFocus: false,
  teleportTo: "body"
});

const emit = defineEmits<{
  open: [];
  close: [reason: "trigger" | "escape" | "outside" | "button" | "programmatic"];
}>();

const open = defineModel<boolean>("open", { default: false });
const triggerElement = ref<HTMLElement | null>(null);
const popoverElement = ref<HTMLElement | null>(null);
const popoverId = `k-popover-${useId()}`;
const titleId = `${popoverId}-title`;
const position = ref({
  top: 0,
  left: 0,
  placement: "bottom" as Exclude<KPopoverPlacement, "auto">
});

const popoverStyle = computed<CSSProperties>(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  width: typeof props.width === "number" ? `${props.width}px` : props.width,
  transformOrigin: {
    top: "bottom center",
    bottom: "top center",
    left: "center right",
    right: "center left"
  }[position.value.placement]
}));

function resolvePlacement(
  trigger: DOMRect,
  panel: DOMRect
): Exclude<KPopoverPlacement, "auto"> {
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
  if (spaces.bottom >= panel.height + gap) {
    return "bottom";
  }
  if (spaces.top >= panel.height + gap) {
    return "top";
  }
  return spaces.right >= spaces.left ? "right" : "left";
}

function alignedLeft(trigger: DOMRect, panel: DOMRect): number {
  if (props.align === "start") {
    return trigger.left;
  }
  if (props.align === "end") {
    return trigger.right - panel.width;
  }
  return trigger.left + (trigger.width - panel.width) / 2;
}

function alignedTop(trigger: DOMRect, panel: DOMRect): number {
  if (props.align === "start") {
    return trigger.top;
  }
  if (props.align === "end") {
    return trigger.bottom - panel.height;
  }
  return trigger.top + (trigger.height - panel.height) / 2;
}

function updatePosition(): void {
  const trigger = triggerElement.value;
  const panel = popoverElement.value;
  if (trigger === null || panel === null) {
    return;
  }
  const triggerRect = trigger.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const placement = resolvePlacement(triggerRect, panelRect);
  const gap = 7;
  const padding = 8;
  let top = alignedTop(triggerRect, panelRect);
  let left = alignedLeft(triggerRect, panelRect);

  if (placement === "top") {
    top = triggerRect.top - panelRect.height - gap;
  } else if (placement === "bottom") {
    top = triggerRect.bottom + gap;
  } else if (placement === "left") {
    left = triggerRect.left - panelRect.width - gap;
  } else {
    left = triggerRect.right + gap;
  }

  position.value = {
    top: Math.max(
      padding,
      Math.min(top, window.innerHeight - panelRect.height - padding)
    ),
    left: Math.max(
      padding,
      Math.min(left, window.innerWidth - panelRect.width - padding)
    ),
    placement
  };
}

async function openPopover(): Promise<void> {
  if (props.disabled || open.value) {
    return;
  }
  open.value = true;
  emit("open");
  await nextTick();
  updatePosition();
}

function closePopover(
  reason: "trigger" | "escape" | "outside" | "button" | "programmatic" =
    "programmatic",
  restoreFocus = false
): void {
  if (!open.value) {
    return;
  }
  open.value = false;
  emit("close", reason);
  if (restoreFocus) {
    void nextTick(() =>
      triggerElement.value?.focus({ preventScroll: true })
    );
  }
}

function toggle(): void {
  if (open.value) {
    closePopover("trigger");
  } else {
    void openPopover();
  }
}

function handleTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
    event.preventDefault();
    void openPopover();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closePopover("escape", true);
  }
}

function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && props.closeOnEscape) {
    event.preventDefault();
    closePopover("escape", true);
  }
}

function handleDocumentPointerDown(event: PointerEvent): void {
  if (!props.closeOnOutside) {
    return;
  }
  const target = event.target as Node;
  if (
    triggerElement.value?.contains(target) ||
    popoverElement.value?.contains(target)
  ) {
    return;
  }
  closePopover("outside");
}

function focusFirstControl(): void {
  if (!props.initialFocus) {
    return;
  }
  popoverElement.value
    ?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    ?.focus({ preventScroll: true });
}

function addGlobalListeners(): void {
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("pointerdown", handleDocumentPointerDown, true);
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
}

function removeGlobalListeners(): void {
  document.removeEventListener("keydown", handleDocumentKeydown);
  document.removeEventListener("pointerdown", handleDocumentPointerDown, true);
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
}

watch(open, async (isOpen) => {
  if (isOpen) {
    addGlobalListeners();
    await nextTick();
    updatePosition();
    focusFirstControl();
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
      closePopover();
    }
  }
);

onBeforeUnmount(removeGlobalListeners);

defineExpose({
  open: openPopover,
  close: closePopover,
  updatePosition
});
</script>

<template>
  <span
    ref="triggerElement"
    class="k-popover__trigger"
    role="button"
    :tabindex="disabled ? -1 : 0"
    aria-haspopup="dialog"
    :aria-expanded="open"
    :aria-controls="open ? popoverId : undefined"
    :aria-disabled="disabled || undefined"
    @click="toggle"
    @keydown="handleTriggerKeydown"
  >
    <slot name="trigger" :open="open"></slot>
  </span>

  <Teleport :to="teleportTo">
    <Transition name="k-popover-material">
      <section
        v-if="open && !disabled"
        :id="popoverId"
        ref="popoverElement"
        class="k-popover"
        :class="`k-popover--${position.placement}`"
        :style="popoverStyle"
        role="dialog"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="title ? undefined : '快捷操作'"
      >
        <header
          v-if="title || description || $slots.header || showClose"
          class="k-popover__header"
        >
          <slot name="header">
            <div class="k-popover__heading">
              <h3 v-if="title" :id="titleId">{{ title }}</h3>
              <p v-if="description">{{ description }}</p>
            </div>
          </slot>
          <button
            v-if="showClose"
            class="k-popover__close"
            type="button"
            aria-label="关闭"
            @click="closePopover('button', true)"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 4 8 8m0-8-8 8" />
            </svg>
          </button>
        </header>

        <div class="k-popover__content">
          <slot :close="closePopover"></slot>
        </div>

        <footer v-if="$slots.actions" class="k-popover__actions">
          <slot name="actions" :close="closePopover"></slot>
        </footer>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.k-popover__trigger {
  display: inline-flex;
  min-width: 0;
  border-radius: 0.5rem;
  cursor: pointer;
  touch-action: manipulation;
}

.k-popover__trigger:active:not([aria-disabled="true"]) {
  transform: scale(0.97);
}

.k-popover__trigger:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

.k-popover__trigger[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.48;
}

.k-popover {
  position: fixed;
  z-index: var(--k-z-popover, 1040);
  max-width: calc(100vw - 1rem);
  max-height: min(28rem, calc(100dvh - 1rem));
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 0.86rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(250, 252, 251, 0.93);
  -webkit-backdrop-filter: blur(1.35rem) saturate(155%);
  backdrop-filter: blur(1.35rem) saturate(155%);
  box-shadow:
    0 1.2rem 3rem -1.35rem rgba(25, 48, 41, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overscroll-behavior: contain;
}

.k-popover__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.75rem 0.82rem 0.5rem;
}

.k-popover__heading {
  min-width: 0;
}

.k-popover__heading h3 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 670;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.k-popover__heading p {
  margin: 0.16rem 0 0;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.68rem;
  line-height: 1.48;
}

.k-popover__close {
  width: 2rem;
  height: 2rem;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 0.52rem;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  cursor: pointer;
}

.k-popover__close:hover {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-popover__close:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
}

.k-popover__close svg {
  width: 0.82rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.k-popover__content {
  padding: 0.72rem 0.82rem;
  font-size: 0.75rem;
  line-height: 1.5;
}

.k-popover__header + .k-popover__content {
  padding-top: 0.25rem;
}

.k-popover__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.42rem;
  border-top: 1px solid var(--k-color-border, rgba(72, 94, 88, 0.12));
  padding: 0.62rem 0.82rem;
}

.k-popover-material-enter-active,
.k-popover-material-leave-active {
  transition:
    opacity 140ms ease-out,
    transform 210ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1)),
    backdrop-filter 180ms ease-out;
}

.k-popover-material-enter-from,
.k-popover-material-leave-to {
  opacity: 0;
  transform: scale(0.96);
  -webkit-backdrop-filter: blur(0.2rem);
  backdrop-filter: blur(0.2rem);
}

@media (max-width: 40rem) {
  .k-popover__trigger {
    min-height: 2.75rem;
    align-items: center;
  }

  .k-popover__close {
    width: 2.75rem;
    height: 2.75rem;
    margin: -0.38rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-popover-material-enter-active,
  .k-popover-material-leave-active {
    transition: opacity 110ms ease-out;
  }

  .k-popover-material-enter-from,
  .k-popover-material-leave-to,
  .k-popover__trigger:active:not([aria-disabled="true"]) {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-popover {
    background: var(--k-color-surface, #fff);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-popover {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
