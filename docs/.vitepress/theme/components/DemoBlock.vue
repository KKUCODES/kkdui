<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  code: string;
}>();

const sourceVisible = ref(false);
</script>

<template>
  <section class="demo-block">
    <div class="demo-block__preview">
      <slot />
    </div>
    <div class="demo-block__toolbar">
      <button
        class="demo-block__toggle"
        type="button"
        :aria-expanded="sourceVisible"
        @click="sourceVisible = !sourceVisible"
      >
        <span aria-hidden="true">{{ sourceVisible ? "⌃" : "⌄" }}</span>
        {{ sourceVisible ? "收起源码" : "查看源码" }}
      </button>
    </div>
    <div v-if="sourceVisible" class="demo-block__source">
      <pre><code>{{ code.trim() }}</code></pre>
    </div>
  </section>
</template>
