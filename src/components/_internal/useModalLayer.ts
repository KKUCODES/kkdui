import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  unref,
  watch,
  type MaybeRef,
  type Ref,
  type WatchStopHandle
} from "vue";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']"
].join(",");

let bodyLockCount = 0;
let originalBodyOverflow = "";

function lockBodyScroll(): void {
  if (bodyLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  bodyLockCount += 1;
}

function unlockBodyScroll(): void {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
  }
}

interface UseModalLayerOptions {
  readonly open: Ref<boolean>;
  readonly panel: Ref<HTMLElement | null>;
  readonly closeOnEscape: MaybeRef<boolean>;
  readonly onDismiss: () => void;
}

export function useModalLayer(options: UseModalLayerOptions): void {
  let previouslyFocused: HTMLElement | null = null;
  let stopWatching: WatchStopHandle | undefined;
  let scrollLocked = false;

  function getFocusableElements(): HTMLElement[] {
    if (options.panel.value === null) {
      return [];
    }

    return Array.from(
      options.panel.value.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((element) => !element.hasAttribute("hidden"));
  }

  function focusInitialElement(): void {
    const panel = options.panel.value;
    if (panel === null) {
      return;
    }

    const autofocusElement = panel.querySelector<HTMLElement>("[autofocus]");
    const contentElement = panel.querySelector<HTMLElement>(
      "[data-k-modal-content]"
    );
    const firstContentElement =
      contentElement?.querySelector<HTMLElement>(focusableSelector);
    const firstFocusableElement = getFocusableElements()[0];
    (
      autofocusElement ??
      firstContentElement ??
      firstFocusableElement ??
      panel
    ).focus({
      preventScroll: true
    });
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && unref(options.closeOnEscape)) {
      event.preventDefault();
      options.onDismiss();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      options.panel.value?.focus({ preventScroll: true });
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1)!;
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  async function handleOpenState(isOpen: boolean): Promise<void> {
    if (isOpen) {
      previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      lockBodyScroll();
      scrollLocked = true;
      document.addEventListener("keydown", handleKeydown, true);
      await nextTick();
      focusInitialElement();
      return;
    }

    document.removeEventListener("keydown", handleKeydown, true);
    if (scrollLocked) {
      unlockBodyScroll();
      scrollLocked = false;
    }
    await nextTick();
    previouslyFocused?.focus({ preventScroll: true });
    previouslyFocused = null;
  }

  onMounted(() => {
    stopWatching = watch(options.open, handleOpenState, {
      immediate: true,
      flush: "post"
    });
  });

  onBeforeUnmount(() => {
    stopWatching?.();
    document.removeEventListener("keydown", handleKeydown, true);
    if (scrollLocked) {
      unlockBodyScroll();
    }
  });
}
