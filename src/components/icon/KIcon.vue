<script setup lang="ts">
import { computed } from "vue";
import type { CSSProperties } from "vue";
import type { KIconProps } from "./types";

const props = withDefaults(defineProps<KIconProps>(), {
  size: "1em",
});

const iconStyle = computed<CSSProperties>(() => ({
  "--k-icon-size":
    typeof props.size === "number" ? `${props.size}px` : props.size,
  "--k-icon-color": props.color,
}));
</script>

<template>
  <span
    class="k-icon"
    :style="iconStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <slot />
  </span>
</template>

<style scoped>
.k-icon {
  width: var(--k-icon-size);
  height: var(--k-icon-size);
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: var(--k-icon-color, currentColor);
  line-height: 1;
}

.k-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
