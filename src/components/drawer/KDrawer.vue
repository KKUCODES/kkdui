<script setup lang="ts">
import {
  computed,
  ref,
  useId,
  useSlots,
  watch,
  type CSSProperties
} from "vue";
import { CloseIcon } from "../../icons";
import KButton from "../button/KButton.vue";
import { useModalLayer } from "../_internal/useModalLayer";
import type {
  KDrawerCloseReason,
  KDrawerProps
} from "./types";

const props = withDefaults(defineProps<KDrawerProps>(), {
  title: "",
  description: "",
  ariaLabel: "",
  side: "right",
  width: "32rem",
  showClose: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  teleportTo: "body",
  beforeClose: undefined,
  mobileFullscreen: true,
  footerFixed: true,
  resizable: false,
  minWidth: 320,
  maxWidth: 960,
  resizeStep: 8,
  loading: false,
  error: ""
});

const emit = defineEmits<{
  close: [reason: KDrawerCloseReason];
  opened: [];
  closed: [];
  resize: [width: number];
  retry: [];
}>();

const model = defineModel<boolean>({ default: false });
const panelElement = ref<HTMLElement | null>(null);
const slots = useSlots();
const generatedId = useId();
const titleId = `k-drawer-title-${generatedId}`;
const descriptionId = `k-drawer-description-${generatedId}`;
const hasTitle = computed(
  () => props.title !== "" || slots.title !== undefined
);
const hasDescription = computed(() => props.description !== "");
const isClosePending = ref(false);
const currentWidth = ref(parsePixelWidth(props.width));
const resizeStartX = ref(0);
const resizeStartWidth = ref(0);
const isResizing = ref(false);
const panelStyle = computed<CSSProperties>(() => ({
  width:
    props.resizable && currentWidth.value !== null
      ? `${currentWidth.value}px`
      : typeof props.width === "number"
        ? `${props.width}px`
        : props.width
}));
const currentAriaWidth = computed(() =>
  currentWidth.value ?? parsePixelWidth(props.width) ?? props.minWidth
);

watch(
  () => props.width,
  (width) => {
    currentWidth.value = parsePixelWidth(width);
  }
);

function requestClose(reason: KDrawerCloseReason): void {
  if (!model.value || isClosePending.value) {
    return;
  }

  if (props.beforeClose === undefined) {
    commitClose(reason);
    return;
  }

  void guardClose(reason);
}

async function guardClose(reason: KDrawerCloseReason): Promise<void> {
  isClosePending.value = true;
  try {
    const canClose = await props.beforeClose?.(reason);
    if (canClose === false) {
      return;
    }

    commitClose(reason);
  } finally {
    isClosePending.value = false;
  }
}

function commitClose(reason: KDrawerCloseReason): void {
  model.value = false;
  emit("close", reason);
}

function handleBackdropClick(): void {
  if (props.closeOnBackdrop) {
    requestClose("backdrop");
  }
}

function parsePixelWidth(width: string | number): number | null {
  if (typeof width === "number") {
    return width;
  }
  if (/^\d+(?:\.\d+)?px$/.test(width)) {
    return Number.parseFloat(width);
  }

  return null;
}

function clampWidth(width: number): number {
  return Math.min(props.maxWidth, Math.max(props.minWidth, Math.round(width)));
}

function updateWidth(width: number): void {
  const nextWidth = clampWidth(width);
  currentWidth.value = nextWidth;
  emit("resize", nextWidth);
}

function handleResizePointerDown(event: PointerEvent): void {
  if (!props.resizable) {
    return;
  }

  resizeStartX.value = event.clientX;
  resizeStartWidth.value =
    panelElement.value?.getBoundingClientRect().width ||
    currentAriaWidth.value;
  isResizing.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
}

function handleResizePointerMove(event: PointerEvent): void {
  if (!props.resizable || !isResizing.value) {
    return;
  }

  const pointerDelta = event.clientX - resizeStartX.value;
  updateWidth(
    resizeStartWidth.value +
      (props.side === "right" ? -pointerDelta : pointerDelta)
  );
}

function handleResizePointerEnd(event: PointerEvent): void {
  isResizing.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
}

function handleResizeKeydown(event: KeyboardEvent): void {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return;
  }

  event.preventDefault();
  const keyDirection = event.key === "ArrowRight" ? 1 : -1;
  const sideDirection = props.side === "right" ? -1 : 1;
  const renderedWidth =
    panelElement.value?.getBoundingClientRect().width ||
    currentAriaWidth.value;
  updateWidth(renderedWidth + keyDirection * sideDirection * props.resizeStep);
}

useModalLayer({
  open: model,
  panel: panelElement,
  closeOnEscape: computed(() => props.closeOnEscape),
  onDismiss: () => requestClose("escape")
});
</script>

<template>
  <Teleport :to="teleportTo">
    <Transition
      name="k-drawer"
      @after-enter="emit('opened')"
      @after-leave="emit('closed')"
    >
      <div
        v-if="model"
        class="k-drawer"
        :class="[
          `k-drawer--${side}`,
          {
            'k-drawer--mobile-fullscreen': mobileFullscreen,
            'k-drawer--fixed-footer': footerFixed,
            'k-drawer--resizable': resizable
          }
        ]"
        @mousedown.self="handleBackdropClick"
      >
        <aside
          ref="panelElement"
          class="k-drawer__panel"
          :style="panelStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="!hasTitle ? ariaLabel || undefined : undefined"
          :aria-labelledby="hasTitle ? titleId : undefined"
          :aria-describedby="hasDescription ? descriptionId : undefined"
          :aria-busy="isClosePending || loading"
          tabindex="-1"
        >
          <div
            v-if="resizable"
            class="k-drawer__resize-handle"
            role="separator"
            aria-label="调整抽屉宽度"
            aria-orientation="vertical"
            :aria-valuemin="minWidth"
            :aria-valuemax="maxWidth"
            :aria-valuenow="currentAriaWidth"
            tabindex="0"
            @pointerdown.prevent="handleResizePointerDown"
            @pointermove="handleResizePointerMove"
            @pointerup="handleResizePointerEnd"
            @pointercancel="handleResizePointerEnd"
            @keydown="handleResizeKeydown"
          />
          <header
            v-if="hasTitle || hasDescription || showClose"
            class="k-drawer__header"
          >
            <div class="k-drawer__heading">
              <h2 v-if="hasTitle || $slots.title" :id="titleId">
                <slot name="title">{{ title }}</slot>
              </h2>
              <p v-if="hasDescription" :id="descriptionId">
                {{ description }}
              </p>
            </div>
            <button
              v-if="showClose"
              class="k-drawer__close"
              type="button"
              aria-label="关闭抽屉"
              :disabled="isClosePending"
              @click="requestClose('close-button')"
            >
              <CloseIcon />
            </button>
          </header>

          <div
            class="k-drawer__body"
            data-k-modal-content
            :aria-busy="loading"
          >
            <slot v-if="loading" name="loading">
              <div class="k-drawer__state" role="status">
                <span class="k-drawer__spinner" aria-hidden="true"></span>
                <span>正在加载详情…</span>
              </div>
            </slot>
            <slot v-else-if="error" name="error" :error="error">
              <div class="k-drawer__state" role="alert">
                <strong>内容加载失败</strong>
                <span>{{ error }}</span>
                <KButton
                  class="k-drawer__retry"
                  variant="secondary"
                  size="small"
                  @click="emit('retry')"
                >
                  重新加载
                </KButton>
              </div>
            </slot>
            <slot v-else />
          </div>

          <footer v-if="$slots.footer" class="k-drawer__footer">
            <slot name="footer" :close-pending="isClosePending" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.k-drawer {
  position: fixed;
  inset: 0;
  z-index: var(--k-z-drawer, 1080);
  display: flex;
  background: rgba(20, 29, 27, 0.22);
  -webkit-backdrop-filter: blur(0.12rem);
  backdrop-filter: blur(0.12rem);
}

.k-drawer--right {
  justify-content: flex-end;
}

.k-drawer--left {
  justify-content: flex-start;
}

.k-drawer__panel {
  position: relative;
  width: 32rem;
  max-width: min(92vw, 100%);
  height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border-left: 1px solid rgba(255, 255, 255, 0.7);
  color: var(--k-color-text, #1d2725);
  background: rgba(248, 251, 249, 0.94);
  -webkit-backdrop-filter: blur(1.8rem) saturate(150%);
  backdrop-filter: blur(1.8rem) saturate(150%);
  box-shadow:
    -1.5rem 0 4rem -2rem rgba(20, 38, 33, 0.45),
    inset 1px 0 0 rgba(255, 255, 255, 0.85);
  outline: 0;
}

.k-drawer:not(.k-drawer--fixed-footer) .k-drawer__panel {
  display: block;
  overflow: auto;
}

.k-drawer:not(.k-drawer--fixed-footer) .k-drawer__body {
  overflow: visible;
}

.k-drawer__resize-handle {
  position: absolute;
  inset-block: 0;
  left: -0.35rem;
  z-index: 3;
  width: 0.7rem;
  cursor: col-resize;
  touch-action: none;
}

.k-drawer--left .k-drawer__resize-handle {
  right: -0.35rem;
  left: auto;
}

.k-drawer__resize-handle::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.2rem;
  height: 2.8rem;
  border-radius: 999px;
  background: rgba(93, 114, 108, 0.24);
  content: "";
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 140ms ease-out, background-color 140ms ease-out;
}

.k-drawer__resize-handle:hover::after,
.k-drawer__resize-handle:focus-visible::after {
  background: var(--k-color-primary, #257360);
  opacity: 0.8;
}

.k-drawer__resize-handle:focus-visible {
  outline: none;
}

.k-drawer--left .k-drawer__panel {
  border-right: 1px solid rgba(255, 255, 255, 0.7);
  border-left: 0;
  box-shadow:
    1.5rem 0 4rem -2rem rgba(20, 38, 33, 0.45),
    inset -1px 0 0 rgba(255, 255, 255, 0.85);
}

.k-drawer__header {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem 1.4rem;
}

.k-drawer__heading {
  min-width: 0;
  display: grid;
  gap: 0.35rem;
}

.k-drawer__heading h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 680;
  letter-spacing: -0.012em;
  line-height: 1.25;
}

.k-drawer__heading p {
  max-width: 58ch;
  margin: 0;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.76rem;
  line-height: 1.55;
}

.k-drawer__close {
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: var(--k-color-text-muted, #65706d);
  background: rgba(105, 123, 117, 0.1);
  cursor: pointer;
  touch-action: manipulation;
  transition:
    color 140ms ease-out,
    background-color 140ms ease-out,
    transform 100ms ease-out;
}

.k-drawer__close:hover {
  color: var(--k-color-text, #1d2725);
  background: rgba(105, 123, 117, 0.16);
}

.k-drawer__close:active {
  transform: scale(0.92);
}

.k-drawer__close:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

.k-drawer__close svg {
  width: 0.8rem;
  height: 0.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.k-drawer__body {
  min-height: 0;
  overflow: auto;
  padding: 0.65rem 1.4rem 1.4rem;
  overscroll-behavior: contain;
}

.k-drawer__state {
  min-height: 14rem;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.65rem;
  color: var(--k-color-text-muted, #65706d);
  text-align: center;
}

.k-drawer__state strong {
  color: var(--k-color-text, #1d2725);
  font-size: 0.9rem;
}

.k-drawer__state span {
  font-size: 0.78rem;
}

.k-drawer__spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(37, 115, 96, 0.2);
  border-top-color: var(--k-color-primary, #257360);
  border-radius: 50%;
  animation: k-drawer-spin 800ms linear infinite;
}

@keyframes k-drawer-spin {
  to {
    transform: rotate(360deg);
  }
}

.k-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.9rem 1.4rem 1.15rem;
  background: linear-gradient(
    to bottom,
    rgba(248, 251, 249, 0),
    rgba(248, 251, 249, 0.97) 28%
  );
}

.k-drawer-enter-active,
.k-drawer-leave-active {
  transition: opacity 220ms ease-out;
}

.k-drawer-enter-active .k-drawer__panel,
.k-drawer-leave-active .k-drawer__panel {
  transition: transform 340ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-drawer-enter-from,
.k-drawer-leave-to {
  opacity: 0;
}

.k-drawer--right.k-drawer-enter-from .k-drawer__panel,
.k-drawer--right.k-drawer-leave-to .k-drawer__panel {
  transform: translateX(100%);
}

.k-drawer--left.k-drawer-enter-from .k-drawer__panel,
.k-drawer--left.k-drawer-leave-to .k-drawer__panel {
  transform: translateX(-100%);
}

@media (max-width: 40rem) {
  .k-drawer--mobile-fullscreen .k-drawer__panel {
    width: 100% !important;
    max-width: 100%;
  }

  .k-drawer__resize-handle {
    display: none;
  }

  .k-drawer__close {
    width: 2.75rem;
    height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-drawer-enter-active,
  .k-drawer-leave-active,
  .k-drawer-enter-active .k-drawer__panel,
  .k-drawer-leave-active .k-drawer__panel {
    transition: opacity 140ms ease-out;
  }

  .k-drawer-enter-from .k-drawer__panel,
  .k-drawer-leave-to .k-drawer__panel {
    transform: none;
  }

  .k-drawer__close:active {
    transform: none;
  }

  .k-drawer__resize-handle::after {
    transition: none;
  }

  .k-drawer__spinner {
    animation: none;
    border-color: var(--k-color-primary, #257360);
    opacity: 0.55;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-drawer {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .k-drawer__panel {
    background: var(--k-color-surface, #ffffff);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-drawer__panel {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
