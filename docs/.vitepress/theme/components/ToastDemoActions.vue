<script setup lang="ts">
import { KButton, useKToast } from "../../../../src";

const toast = useKToast();
</script>

<template>
  <div class="demo-row">
    <KButton
      size="small"
      @click="
        toast.success('配置已保存', {
          description: '新配置将在下次请求时生效。',
        })
      "
    >
      成功通知
    </KButton>
    <KButton
      size="small"
      variant="secondary"
      @click="
        toast.warning('连接不稳定', {
          description: '系统正在自动重试。',
        })
      "
    >
      警告通知
    </KButton>
  </div>
</template>
