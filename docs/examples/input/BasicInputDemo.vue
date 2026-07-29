<script setup lang="ts">
import { ref } from "vue";

const keyword = ref("");
</script>

<template>
  <div class="demo-column">
    <KInput v-model="keyword" placeholder="输入用户名、邮箱或 ID" />
    <p class="demo-value">当前输入：{{ keyword || "暂无" }}</p>
  </div>
</template>
