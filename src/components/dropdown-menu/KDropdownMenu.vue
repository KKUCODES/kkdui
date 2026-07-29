<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type CSSProperties
} from "vue";
import { MoreIcon } from "../../icons";
import type {
  KDropdownMenuItem,
  KDropdownMenuProps
} from "./types";

const props = withDefaults(defineProps<KDropdownMenuProps>(), {
  align: "end",
  triggerLabel: "更多操作",
  disabled: false,
  closeOnSelect: true,
  minWidth: "11rem",
  teleportTo: "body"
});

const emit = defineEmits<{
  select: [item: KDropdownMenuItem];
  confirm: [item: KDropdownMenuItem];
  close: [];
}>();

const open = defineModel<boolean>("open", { default: false });
const triggerElement = ref<HTMLButtonElement | null>(null);
const menuElement = ref<HTMLElement | null>(null);
const menuPosition = ref({
  top: 0,
  left: 0,
  placement: "bottom" as "top" | "bottom"
});
const menuStyle = computed<CSSProperties>(() => ({
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`,
  minWidth:
    typeof props.minWidth === "number"
      ? `${props.minWidth}px`
      : props.minWidth,
  transformOrigin:
    menuPosition.value.placement === "bottom"
      ? props.align === "end" ? "top right" : "top left"
      : props.align === "end" ? "bottom right" : "bottom left"
}));
const enabledItems = computed(() =>
  props.items.filter((item) => !item.disabled && !item.loading)
);

function updatePosition(): void {
  const trigger = triggerElement.value;
  const menu = menuElement.value;
  if (trigger === null || menu === null) {
    return;
  }

  const triggerRect = trigger.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const viewportPadding = 8;
  const gap = 6;
  const availableBelow = window.innerHeight - triggerRect.bottom;
  const showAbove =
    availableBelow < menuRect.height + gap &&
    triggerRect.top > availableBelow;
  const preferredTop = showAbove
    ? triggerRect.top - menuRect.height - gap
    : triggerRect.bottom + gap;
  const preferredLeft =
    props.align === "end"
      ? triggerRect.right - menuRect.width
      : triggerRect.left;

  menuPosition.value = {
    top: Math.max(
      viewportPadding,
      Math.min(
        preferredTop,
        window.innerHeight - menuRect.height - viewportPadding
      )
    ),
    left: Math.max(
      viewportPadding,
      Math.min(preferredLeft, window.innerWidth - menuRect.width - viewportPadding)
    ),
    placement: showAbove ? "top" : "bottom"
  };
}

function getMenuButtons(): HTMLButtonElement[] {
  return menuElement.value === null
    ? []
    : Array.from(
        menuElement.value.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not([disabled])'
        )
      );
}

function focusMenuItem(position: "first" | "last"): void {
  const buttons = getMenuButtons();
  const button = position === "first" ? buttons[0] : buttons.at(-1);
  button?.focus({ preventScroll: true });
}

async function openMenu(focusPosition: "first" | "last" = "first"): Promise<void> {
  if (props.disabled || props.items.length === 0) {
    return;
  }

  open.value = true;
  await nextTick();
  updatePosition();
  focusMenuItem(focusPosition);
}

function closeMenu(restoreFocus = false): void {
  if (!open.value) {
    return;
  }

  open.value = false;
  emit("close");
  if (restoreFocus) {
    nextTick(() => triggerElement.value?.focus({ preventScroll: true }));
  }
}

function toggleMenu(): void {
  if (open.value) {
    closeMenu();
  } else {
    void openMenu();
  }
}

function handleTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    void openMenu(event.key === "ArrowUp" ? "last" : "first");
  }
}

function handleMenuKeydown(event: KeyboardEvent): void {
  const buttons = getMenuButtons();
  const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);

  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(true);
    return;
  }
  if (event.key === "Tab") {
    closeMenu();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    return;
  }

  event.preventDefault();
  let nextIndex = currentIndex;
  if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = buttons.length - 1;
  } else {
    const direction = event.key === "ArrowDown" ? 1 : -1;
    nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
  }
  buttons[nextIndex]?.focus();
}

function selectItem(item: KDropdownMenuItem): void {
  if (item.disabled || item.loading) {
    return;
  }

  if (item.requiresConfirmation) {
    emit("confirm", item);
  } else {
    emit("select", item);
  }
  if (props.closeOnSelect) {
    closeMenu(true);
  }
}

function handleDocumentPointerDown(event: PointerEvent): void {
  const target = event.target as Node;
  if (
    triggerElement.value?.contains(target) ||
    menuElement.value?.contains(target)
  ) {
    return;
  }

  closeMenu();
}

function addGlobalListeners(): void {
  document.addEventListener("pointerdown", handleDocumentPointerDown, true);
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
}

function removeGlobalListeners(): void {
  document.removeEventListener("pointerdown", handleDocumentPointerDown, true);
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
}

watch(open, async (isOpen) => {
  if (isOpen) {
    addGlobalListeners();
    await nextTick();
    updatePosition();
    if (!menuElement.value?.contains(document.activeElement)) {
      focusMenuItem("first");
    }
  } else {
    removeGlobalListeners();
  }
}, {
  immediate: true,
  flush: "post"
});

onBeforeUnmount(removeGlobalListeners);
</script>

<template>
  <span class="k-dropdown-menu">
    <button
      ref="triggerElement"
      class="k-dropdown-menu__trigger"
      type="button"
      :disabled="disabled || items.length === 0"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="triggerLabel"
      @click="toggleMenu"
      @keydown="handleTriggerKeydown"
    >
      <slot name="trigger" :open="open">
        <MoreIcon />
      </slot>
    </button>

    <Teleport :to="teleportTo">
      <Transition name="k-dropdown-popover">
        <div
          v-if="open"
          ref="menuElement"
          class="k-dropdown-menu__popover"
          :style="menuStyle"
          role="menu"
          :aria-label="triggerLabel"
          @keydown="handleMenuKeydown"
        >
          <template v-for="item in items" :key="item.key">
            <div
              v-if="item.groupLabel"
              class="k-dropdown-menu__group"
              role="presentation"
            >
              {{ item.groupLabel }}
            </div>
            <div
              v-if="item.separatorBefore"
              class="k-dropdown-menu__separator"
              role="separator"
            ></div>
            <button
              class="k-dropdown-menu__item"
              :class="{ 'is-danger': item.danger }"
              type="button"
              role="menuitem"
              :disabled="item.disabled || item.loading"
              :title="item.disabledReason || undefined"
              :aria-description="item.disabledReason || item.description || undefined"
              @click="selectItem(item)"
            >
              <span v-if="item.loading" class="k-dropdown-menu__spinner" aria-hidden="true"></span>
              <span
                v-else-if="item.icon"
                class="k-dropdown-menu__icon"
                aria-hidden="true"
              >
                {{ item.icon }}
              </span>
              <span class="k-dropdown-menu__copy">
                <strong>{{ item.label }}</strong>
                <small v-if="item.description || item.disabledReason">
                  {{ item.disabledReason || item.description }}
                </small>
              </span>
              <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.k-dropdown-menu {
  display: inline-flex;
}

.k-dropdown-menu__trigger {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 0.68rem;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: transparent;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 140ms ease-out,
    border-color 140ms ease-out,
    background-color 140ms ease-out,
    transform 100ms ease-out;
}

.k-dropdown-menu__trigger:hover:not(:disabled),
.k-dropdown-menu__trigger[aria-expanded="true"] {
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.07));
}

.k-dropdown-menu__trigger:active:not(:disabled) {
  transform: scale(0.92);
}

.k-dropdown-menu__trigger:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.1rem;
}

.k-dropdown-menu__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.k-dropdown-menu__trigger svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.k-dropdown-menu__popover {
  position: fixed;
  z-index: var(--k-z-dropdown, 1020);
  max-width: calc(100vw - 1rem);
  max-height: min(22rem, calc(100dvh - 1rem));
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 0.82rem;
  padding: 0.32rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(250, 252, 251, 0.92);
  -webkit-backdrop-filter: blur(1.35rem) saturate(155%);
  backdrop-filter: blur(1.35rem) saturate(155%);
  box-shadow:
    0 1.1rem 2.8rem -1.3rem rgba(25, 48, 41, 0.46),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overscroll-behavior: contain;
}

.k-dropdown-menu__item {
  width: 100%;
  min-height: 2.35rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  border: 0;
  border-radius: 0.58rem;
  padding: 0.45rem 0.7rem;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 540;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 120ms ease-out,
    background-color 120ms ease-out,
    transform 80ms ease-out;
}

.k-dropdown-menu__copy {
  min-width: 0;
  display: grid;
  gap: 0.1rem;
  flex: 1;
}

.k-dropdown-menu__copy strong {
  font: inherit;
  font-weight: 560;
}

.k-dropdown-menu__copy small {
  overflow: hidden;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.64rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-dropdown-menu__icon {
  width: 1.1rem;
  flex: 0 0 auto;
  color: var(--k-color-text-muted, #65706d);
  text-align: center;
}

.k-dropdown-menu__spinner {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: k-dropdown-spin 680ms linear infinite;
}

.k-dropdown-menu__group {
  padding: 0.5rem 0.7rem 0.25rem;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.62rem;
  font-weight: 650;
  letter-spacing: 0.04em;
}

@keyframes k-dropdown-spin {
  to { transform: rotate(360deg); }
}

.k-dropdown-menu__item:hover:not(:disabled),
.k-dropdown-menu__item:focus:not(:disabled) {
  background: var(--k-color-surface-hover, rgba(37, 115, 96, 0.075));
  outline: 0;
}

.k-dropdown-menu__item:active:not(:disabled) {
  transform: scale(0.98);
}

.k-dropdown-menu__item.is-danger {
  color: var(--k-color-danger, #b34a4a);
}

.k-dropdown-menu__item.is-danger:hover:not(:disabled),
.k-dropdown-menu__item.is-danger:focus:not(:disabled) {
  background: rgba(179, 74, 74, 0.09);
}

.k-dropdown-menu__item:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.k-dropdown-menu__item kbd {
  color: var(--k-color-text-subtle, #929d99);
  font: inherit;
  font-size: 0.64rem;
}

.k-dropdown-menu__separator {
  height: 1px;
  margin: 0.28rem 0.4rem;
  background: rgba(114, 131, 126, 0.15);
}

.k-dropdown-popover-enter-active,
.k-dropdown-popover-leave-active {
  transition:
    opacity 150ms ease-out,
    transform 210ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-dropdown-popover-enter-from,
.k-dropdown-popover-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (max-width: 40rem) {
  .k-dropdown-menu__trigger {
    width: 2.75rem;
    height: 2.75rem;
  }

  .k-dropdown-menu__item {
    min-height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-dropdown-popover-enter-active,
  .k-dropdown-popover-leave-active {
    transition: opacity 120ms ease-out;
  }

  .k-dropdown-popover-enter-from,
  .k-dropdown-popover-leave-to,
  .k-dropdown-menu__trigger:active:not(:disabled),
  .k-dropdown-menu__item:active:not(:disabled) {
    transform: none;
  }

  .k-dropdown-menu__spinner {
    animation-duration: 1200ms;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-dropdown-menu__popover {
    background: var(--k-color-surface, #ffffff);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-dropdown-menu__popover {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
