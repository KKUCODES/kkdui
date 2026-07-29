<script setup lang="ts">
import { ref } from "vue";

const password = ref("kkdui-admin");
</script>

<template>
  <div class="demo-column">
    <KInput
      v-model="password"
      type="password"
      revealable
      placeholder="输入密码"
    />
    <KInput model-value="格式不正确" invalid aria-label="错误状态示例" />
    <KInput model-value="不可编辑内容" disabled aria-label="禁用状态示例" />
  </div>
</template>
