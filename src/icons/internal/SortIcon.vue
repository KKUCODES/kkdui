<script setup lang="ts">
defineProps<{
  direction?: "asc" | "desc";
}>();
</script>

<template>
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m4 6 4-4 4 4" :class="{ 'is-active': direction === 'asc' }" />
    <path d="m4 10 4 4 4-4" :class="{ 'is-active': direction === 'desc' }" />
  </svg>
</template>

<style scoped>
path {
  opacity: 0.22;
}

path.is-active {
  color: var(--k-color-primary, #257360);
  opacity: 1;
}
</style>
