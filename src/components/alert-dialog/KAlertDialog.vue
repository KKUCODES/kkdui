<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useId,
  watch
} from "vue";
import AlertWarningIcon from "../../icons/internal/AlertWarningIcon.vue";
import KButton from "../button/KButton.vue";
import KDialog from "../dialog/KDialog.vue";
import type { KDialogCloseReason } from "../dialog/types";
import type {
  KAlertDialogConfirmPayload,
  KAlertDialogProps
} from "./types";

const props = withDefaults(defineProps<KAlertDialogProps>(), {
  description: "",
  tone: "warning",
  confirmText: "确认",
  cancelText: "取消",
  confirmVariant: "danger",
  confirmLoading: false,
  confirmDisabled: false,
  closeOnEscape: true,
  teleportTo: "body",
  confirmationText: "",
  confirmationValue: "",
  confirmationInputLabel: "确认文字",
  reason: "",
  showReason: false,
  reasonRequired: false,
  reasonMinLength: 1,
  reasonMaxLength: 500,
  reasonLabel: "操作原因",
  reasonPlaceholder: "请输入执行该操作的原因",
  confirmCountdown: 0
});

const emit = defineEmits<{
  confirm: [payload: KAlertDialogConfirmPayload];
  cancel: [reason: "cancel-button" | KDialogCloseReason];
  "update:confirmationValue": [value: string];
  "update:reason": [value: string];
}>();

const model = defineModel<boolean>({ default: false });
const confirmationInput = ref(props.confirmationValue);
const reasonInput = ref(props.reason);
const countdownRemaining = ref(0);
const generatedId = useId();
const confirmationHintId = `k-alert-confirmation-${generatedId}`;
const reasonHintId = `k-alert-reason-${generatedId}`;
let countdownTimer: ReturnType<typeof setInterval> | undefined;
const confirmationIsValid = computed(
  () =>
    props.confirmationText === "" ||
    confirmationInput.value === props.confirmationText
);
const reasonIsValid = computed(
  () =>
    !props.reasonRequired ||
    reasonInput.value.trim().length >= props.reasonMinLength
);
const isConfirmDisabled = computed(
  () =>
    props.confirmDisabled ||
    props.confirmLoading ||
    !confirmationIsValid.value ||
    !reasonIsValid.value ||
    countdownRemaining.value > 0
);
const displayedConfirmText = computed(() =>
  countdownRemaining.value > 0
    ? `${props.confirmText}（${countdownRemaining.value} 秒）`
    : props.confirmText
);

watch(
  () => props.confirmationValue,
  (value) => {
    confirmationInput.value = value;
  }
);

watch(
  () => props.reason,
  (value) => {
    reasonInput.value = value;
  }
);

watch(
  model,
  (isOpen) => {
    clearCountdown();
    if (!isOpen) {
      return;
    }

    confirmationInput.value = props.confirmationValue;
    reasonInput.value = props.reason;
    countdownRemaining.value = Math.max(0, Math.floor(props.confirmCountdown));
    if (countdownRemaining.value === 0) {
      return;
    }

    countdownTimer = setInterval(() => {
      countdownRemaining.value = Math.max(0, countdownRemaining.value - 1);
      if (countdownRemaining.value === 0) {
        clearCountdown();
      }
    }, 1000);
  },
  { immediate: true }
);

onBeforeUnmount(clearCountdown);

function cancel(reason: "cancel-button" | KDialogCloseReason): void {
  if (props.confirmLoading) {
    return;
  }

  model.value = false;
  emit("cancel", reason);
}

function updateConfirmationValue(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  confirmationInput.value = value;
  emit("update:confirmationValue", value);
}

function updateReason(event: Event): void {
  const value = (event.target as HTMLTextAreaElement).value;
  reasonInput.value = value;
  emit("update:reason", value);
}

function confirm(): void {
  if (isConfirmDisabled.value) {
    return;
  }

  emit("confirm", {
    confirmationValue: confirmationInput.value,
    reason: reasonInput.value.trim()
  });
}

function clearCountdown(): void {
  if (countdownTimer !== undefined) {
    clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
}
</script>

<template>
  <KDialog
    v-model="model"
    :title="title"
    :description="description"
    :close-on-escape="closeOnEscape && !confirmLoading"
    :teleport-to="teleportTo"
    role="alertdialog"
    size="small"
    :show-close="false"
    :close-on-backdrop="false"
    @close="cancel"
  >
    <div class="k-alert-dialog__content">
      <span
        class="k-alert-dialog__icon"
        :class="`k-alert-dialog__icon--${tone}`"
        aria-hidden="true"
      >
        <AlertWarningIcon />
      </span>
      <div class="k-alert-dialog__message">
        <slot />
      </div>
    </div>

    <div v-if="$slots['risk-detail']" class="k-alert-dialog__risk-detail">
      <slot name="risk-detail" />
    </div>

    <label
      v-if="confirmationText"
      class="k-alert-dialog__field"
    >
      <span>
        {{ confirmationInputLabel }}
        <small>
          请输入
          <code>{{ confirmationText }}</code>
          后继续
        </small>
      </span>
      <input
        :value="confirmationInput"
        :aria-label="confirmationInputLabel"
        :aria-invalid="!confirmationIsValid"
        :aria-describedby="confirmationHintId"
        autocomplete="off"
        spellcheck="false"
        @input="updateConfirmationValue"
      />
      <small
        :id="confirmationHintId"
        class="k-alert-dialog__hint"
        :class="{ 'is-error': confirmationInput && !confirmationIsValid }"
      >
        {{
          confirmationInput && !confirmationIsValid
            ? "输入内容与指定文字不一致"
            : "必须完全一致，包含大小写和符号"
        }}
      </small>
    </label>

    <label
      v-if="showReason || reasonRequired"
      class="k-alert-dialog__field"
    >
      <span>
        {{ reasonLabel }}
        <small v-if="reasonRequired">必填</small>
      </span>
      <textarea
        :value="reasonInput"
        :aria-label="reasonLabel"
        :aria-required="reasonRequired"
        :aria-invalid="!reasonIsValid"
        :aria-describedby="reasonHintId"
        :maxlength="reasonMaxLength"
        :placeholder="reasonPlaceholder"
        rows="3"
        @input="updateReason"
      ></textarea>
      <small
        :id="reasonHintId"
        class="k-alert-dialog__hint"
        :class="{ 'is-error': !reasonIsValid }"
      >
        {{
          !reasonIsValid
            ? `至少输入 ${reasonMinLength} 个字符`
            : `${reasonInput.length} / ${reasonMaxLength}`
        }}
      </small>
    </label>

    <template #footer>
      <KButton
        variant="secondary"
        :disabled="confirmLoading"
        @click="cancel('cancel-button')"
      >
        {{ cancelText }}
      </KButton>
      <KButton
        :variant="confirmVariant"
        :loading="confirmLoading"
        :disabled="isConfirmDisabled"
        @click="confirm"
      >
        {{ displayedConfirmText }}
      </KButton>
    </template>
  </KDialog>
</template>

<style scoped>
.k-alert-dialog__content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.85rem;
}

.k-alert-dialog__icon {
  width: 2.15rem;
  height: 2.15rem;
  display: grid;
  place-items: center;
  border-radius: 0.72rem;
}

.k-alert-dialog__icon--warning {
  color: #8b681f;
  background: rgba(194, 146, 45, 0.13);
}

.k-alert-dialog__icon--danger {
  color: var(--k-color-danger, #b34a4a);
  background: rgba(179, 74, 74, 0.11);
}

.k-alert-dialog__icon svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.k-alert-dialog__message {
  min-width: 0;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.78rem;
  line-height: 1.6;
}

.k-alert-dialog__risk-detail {
  margin-top: 0.9rem;
  border: 1px solid rgba(179, 74, 74, 0.16);
  border-radius: 0.8rem;
  padding: 0.75rem 0.85rem;
  color: var(--k-color-text-muted, #65706d);
  background: rgba(179, 74, 74, 0.045);
  font-size: 0.75rem;
  line-height: 1.55;
}

.k-alert-dialog__field {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.9rem;
  color: var(--k-color-text, #1d2725);
  font-size: 0.76rem;
  font-weight: 630;
}

.k-alert-dialog__field > span {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.k-alert-dialog__field > span small {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.67rem;
  font-weight: 500;
}

.k-alert-dialog__field code {
  border-radius: 0.3rem;
  padding: 0.08rem 0.28rem;
  color: var(--k-color-text, #1d2725);
  background: rgba(105, 123, 117, 0.1);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.k-alert-dialog__field input,
.k-alert-dialog__field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--k-color-border, #c7d1cd);
  border-radius: var(--k-radius-control, 0.78rem);
  padding: 0.72rem 0.78rem;
  color: var(--k-color-text, #1d2725);
  background: var(--k-color-surface, #ffffff);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.45;
  outline: none;
  transition:
    border-color 140ms ease-out,
    box-shadow 140ms ease-out;
}

.k-alert-dialog__field textarea {
  min-height: 5rem;
  resize: vertical;
}

.k-alert-dialog__field input:focus,
.k-alert-dialog__field textarea:focus {
  border-color: var(--k-color-primary, #257360);
  box-shadow: 0 0 0 0.2rem var(--k-color-focus-ring, rgba(37, 115, 96, 0.14));
}

.k-alert-dialog__field input[aria-invalid="true"]:not(:placeholder-shown),
.k-alert-dialog__field textarea[aria-invalid="true"] {
  border-color: var(--k-color-danger, #b34a4a);
}

.k-alert-dialog__hint {
  justify-self: end;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.66rem;
  font-weight: 500;
}

.k-alert-dialog__hint.is-error {
  color: var(--k-color-danger, #b34a4a);
}

@media (prefers-reduced-motion: reduce) {
  .k-alert-dialog__field input,
  .k-alert-dialog__field textarea {
    transition: none;
  }
}

@media (prefers-contrast: more) {
  .k-alert-dialog__risk-detail,
  .k-alert-dialog__field input,
  .k-alert-dialog__field textarea {
    border-color: currentColor;
  }
}
</style>
