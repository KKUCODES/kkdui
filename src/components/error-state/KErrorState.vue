<script setup lang="ts">
import { ErrorCircleIcon } from "../../icons";
import KStateShell from "../_internal/KStateShell.vue";
import KButton from "../button/KButton.vue";
import type { KErrorStateProps } from "./types";

withDefaults(defineProps<KErrorStateProps>(), {
  title: "加载失败",
  description: "暂时无法获取数据，请稍后重试。",
  retryText: "重新加载",
  showRetry: true,
  retryLoading: false,
  minHeight: "20rem"
});

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <KStateShell
    :title="title"
    :description="description"
    :min-height="minHeight"
    tone="danger"
    role="alert"
  >
    <template #icon>
      <slot name="icon">
        <ErrorCircleIcon />
      </slot>
    </template>

    <slot>
      <KButton
        v-if="showRetry"
        variant="secondary"
        :loading="retryLoading"
        @click="emit('retry')"
      >
        {{ retryText }}
      </KButton>
    </slot>
  </KStateShell>
</template>
