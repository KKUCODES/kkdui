<script setup lang="ts">
import { EmptyBoxIcon } from "../../icons";
import KStateShell from "../_internal/KStateShell.vue";
import KButton from "../button/KButton.vue";
import type { KEmptyStateProps } from "./types";

withDefaults(defineProps<KEmptyStateProps>(), {
  title: "暂无内容",
  description: "当前还没有可显示的数据。",
  actionText: "",
  minHeight: "20rem"
});

const emit = defineEmits<{
  action: [];
}>();
</script>

<template>
  <KStateShell
    :title="title"
    :description="description"
    :min-height="minHeight"
  >
    <template #icon>
      <slot name="icon">
        <EmptyBoxIcon />
      </slot>
    </template>

    <slot>
      <KButton
        v-if="actionText"
        variant="secondary"
        @click="emit('action')"
      >
        {{ actionText }}
      </KButton>
    </slot>
  </KStateShell>
</template>
