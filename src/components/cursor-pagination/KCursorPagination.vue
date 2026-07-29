<script setup lang="ts">
import KButton from "../button/KButton.vue";
import type { KCursorPaginationProps } from "./types";

const props = withDefaults(defineProps<KCursorPaginationProps>(), {
  disabled: false,
  loading: false,
  previousLoading: false,
  nextLoading: false,
  batchLabel: "",
  previousLabel: "上一批",
  nextLabel: "下一批",
  ariaLabel: "游标分页"
});

const emit = defineEmits<{
  previous: [];
  next: [];
}>();
</script>

<template>
  <nav class="k-cursor-pagination" :aria-label="ariaLabel">
    <span v-if="batchLabel" class="k-cursor-pagination__label" role="status">
      {{ batchLabel }}
    </span>
    <div class="k-cursor-pagination__actions">
      <KButton
        size="small"
        variant="secondary"
        :disabled="disabled || loading || !hasPrevious"
        :loading="previousLoading"
        @click="emit('previous')"
      >
        <template #leading>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m10 3-5 5 5 5" />
          </svg>
        </template>
        {{ previousLabel }}
      </KButton>
      <KButton
        size="small"
        variant="secondary"
        :disabled="disabled || loading || !hasNext"
        :loading="nextLoading"
        @click="emit('next')"
      >
        {{ nextLabel }}
        <template #trailing>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m6 3 5 5-5 5" />
          </svg>
        </template>
      </KButton>
    </div>
  </nav>
</template>

<style scoped>
.k-cursor-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.k-cursor-pagination__label {
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.7rem;
}

.k-cursor-pagination__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
}

.k-cursor-pagination svg {
  width: 0.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

@media (max-width: 40rem) {
  .k-cursor-pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .k-cursor-pagination__actions {
    width: 100%;
  }

  .k-cursor-pagination__actions :deep(.k-button) {
    flex: 1;
  }
}
</style>
