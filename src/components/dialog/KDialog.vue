<script setup lang="ts">
import {
  computed,
  ref,
  useId,
  useSlots
} from "vue";
import { CloseIcon } from "../../icons";
import { useModalLayer } from "../_internal/useModalLayer";
import type {
  KDialogCloseReason,
  KDialogProps
} from "./types";

const props = withDefaults(defineProps<KDialogProps>(), {
  title: "",
  description: "",
  ariaLabel: "",
  size: "medium",
  role: "dialog",
  showClose: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  teleportTo: "body",
  beforeClose: undefined,
  mobileFullscreen: false,
  footerFixed: true,
  form: ""
});

const emit = defineEmits<{
  close: [reason: KDialogCloseReason];
  opened: [];
  closed: [];
  submit: [event: SubmitEvent];
}>();

const model = defineModel<boolean>({ default: false });
const panelElement = ref<HTMLElement | null>(null);
const slots = useSlots();
const generatedId = useId();
const titleId = `k-dialog-title-${generatedId}`;
const descriptionId = `k-dialog-description-${generatedId}`;
const hasTitle = computed(
  () => props.title !== "" || slots.title !== undefined
);
const hasDescription = computed(() => props.description !== "");
const isClosePending = ref(false);

function requestClose(reason: KDialogCloseReason): void {
  if (!model.value || isClosePending.value) {
    return;
  }

  if (props.beforeClose === undefined) {
    commitClose(reason);
    return;
  }

  void guardClose(reason);
}

async function guardClose(reason: KDialogCloseReason): Promise<void> {
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

function commitClose(reason: KDialogCloseReason): void {
  model.value = false;
  emit("close", reason);
}

function handleBackdropClick(): void {
  if (props.closeOnBackdrop) {
    requestClose("backdrop");
  }
}

function handleSubmit(event: Event): void {
  emit("submit", event as SubmitEvent);
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
      name="k-dialog"
      @after-enter="emit('opened')"
      @after-leave="emit('closed')"
    >
      <div
        v-if="model"
        class="k-dialog"
        :class="{
          'k-dialog--mobile-fullscreen': mobileFullscreen,
          'k-dialog--fixed-footer': footerFixed
        }"
        @mousedown.self="handleBackdropClick"
      >
        <section
          ref="panelElement"
          class="k-dialog__panel"
          :class="`k-dialog__panel--${size}`"
          :role="role"
          aria-modal="true"
          :aria-label="!hasTitle ? ariaLabel || undefined : undefined"
          :aria-labelledby="hasTitle ? titleId : undefined"
          :aria-describedby="hasDescription ? descriptionId : undefined"
          :aria-busy="isClosePending"
          tabindex="-1"
        >
          <header
            v-if="hasTitle || hasDescription || $slots.title || showClose"
            class="k-dialog__header"
          >
            <div class="k-dialog__heading">
              <h2 v-if="hasTitle || $slots.title" :id="titleId">
                <slot name="title">{{ title }}</slot>
              </h2>
              <p v-if="hasDescription" :id="descriptionId">
                {{ description }}
              </p>
            </div>
            <button
              v-if="showClose"
              class="k-dialog__close"
              type="button"
              aria-label="关闭对话框"
              :disabled="isClosePending"
              @click="requestClose('close-button')"
            >
              <CloseIcon />
            </button>
          </header>

          <component
            :is="form ? 'form' : 'div'"
            :id="form || undefined"
            class="k-dialog__body"
            data-k-modal-content
            @submit="handleSubmit"
          >
            <slot />
          </component>

          <footer v-if="$slots.footer" class="k-dialog__footer">
            <slot
              name="footer"
              :form="form || undefined"
              :close-pending="isClosePending"
            />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.k-dialog {
  position: fixed;
  inset: 0;
  z-index: var(--k-z-dialog, 1100);
  display: grid;
  place-items: center;
  overflow: auto;
  padding: 1rem;
  background: rgba(20, 29, 27, 0.34);
  -webkit-backdrop-filter: blur(0.2rem);
  backdrop-filter: blur(0.2rem);
}

.k-dialog__panel {
  width: min(100%, 34rem);
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 1.35rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(250, 252, 251, 0.94);
  -webkit-backdrop-filter: blur(1.6rem) saturate(155%);
  backdrop-filter: blur(1.6rem) saturate(155%);
  box-shadow:
    0 2rem 5rem -2rem rgba(20, 38, 33, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  outline: 0;
}

.k-dialog:not(.k-dialog--fixed-footer) .k-dialog__panel {
  display: block;
  overflow: auto;
}

.k-dialog:not(.k-dialog--fixed-footer) .k-dialog__body {
  overflow: visible;
}

.k-dialog__panel--small {
  width: min(100%, 26rem);
}

.k-dialog__panel--large {
  width: min(100%, 48rem);
}

.k-dialog__header {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.85rem 1.4rem;
}

.k-dialog__heading {
  min-width: 0;
  display: grid;
  gap: 0.35rem;
}

.k-dialog__heading h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 680;
  letter-spacing: -0.012em;
  line-height: 1.25;
}

.k-dialog__heading p {
  max-width: 58ch;
  margin: 0;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.76rem;
  line-height: 1.55;
}

.k-dialog__close {
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

.k-dialog__close:hover {
  color: var(--k-color-text, #1d2725);
  background: rgba(105, 123, 117, 0.16);
}

.k-dialog__close:active {
  transform: scale(0.92);
}

.k-dialog__close:focus-visible {
  outline: 0.18rem solid var(--k-color-focus-ring, rgba(37, 115, 96, 0.17));
  outline-offset: 0.12rem;
}

.k-dialog__close svg {
  width: 0.8rem;
  height: 0.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.k-dialog__body {
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 0.55rem 1.4rem 1.4rem;
  overscroll-behavior: contain;
}

.k-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.9rem 1.4rem 1.15rem;
  background: linear-gradient(
    to bottom,
    rgba(250, 252, 251, 0),
    rgba(250, 252, 251, 0.96) 28%
  );
}

.k-dialog-enter-active,
.k-dialog-leave-active {
  transition: opacity 220ms ease-out;
}

.k-dialog-enter-active .k-dialog__panel,
.k-dialog-leave-active .k-dialog__panel {
  transition:
    opacity 240ms ease-out,
    transform 320ms var(--k-ease-spring, cubic-bezier(0.2, 0.8, 0.2, 1));
}

.k-dialog-enter-from,
.k-dialog-leave-to {
  opacity: 0;
}

.k-dialog-enter-from .k-dialog__panel,
.k-dialog-leave-to .k-dialog__panel {
  opacity: 0;
  transform: translateY(0.65rem) scale(0.975);
}

@media (max-width: 40rem) {
  .k-dialog {
    align-items: end;
    padding: 0.5rem 0.5rem 0;
  }

  .k-dialog__panel,
  .k-dialog__panel--small,
  .k-dialog__panel--large {
    width: 100%;
    max-height: 92dvh;
    border-radius: 1.35rem 1.35rem 0 0;
  }

  .k-dialog--mobile-fullscreen {
    padding: 0;
  }

  .k-dialog--mobile-fullscreen .k-dialog__panel,
  .k-dialog--mobile-fullscreen .k-dialog__panel--small,
  .k-dialog--mobile-fullscreen .k-dialog__panel--large {
    height: 100dvh;
    max-height: 100dvh;
    border: 0;
    border-radius: 0;
  }

  .k-dialog__close {
    width: 2.75rem;
    height: 2.75rem;
  }

  .k-dialog-enter-from .k-dialog__panel,
  .k-dialog-leave-to .k-dialog__panel {
    transform: translateY(1.5rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-dialog-enter-active,
  .k-dialog-leave-active,
  .k-dialog-enter-active .k-dialog__panel,
  .k-dialog-leave-active .k-dialog__panel {
    transition: opacity 140ms ease-out;
  }

  .k-dialog-enter-from .k-dialog__panel,
  .k-dialog-leave-to .k-dialog__panel {
    transform: none;
  }

  .k-dialog__close:active {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .k-dialog {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .k-dialog__panel {
    background: var(--k-color-surface, #ffffff);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .k-dialog__panel {
    border-color: var(--k-color-text, #1d2725);
  }
}
</style>
