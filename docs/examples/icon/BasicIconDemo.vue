<script setup lang="ts">
import { KIcon } from "../../../src";
import {
  CheckIcon,
  CloseIcon,
  RefreshIcon,
  SearchIcon,
} from "../../../src/icons";
</script>

<template>
  <div class="demo-row">
    <KIcon :size="20" label="搜索">
      <SearchIcon />
    </KIcon>
    <KIcon :size="20" color="#257360" label="完成">
      <CheckIcon />
    </KIcon>
    <KIcon :size="20" color="#b34a4a" label="关闭">
      <CloseIcon />
    </KIcon>
    <KIcon :size="20" color="#55746b" label="刷新">
      <RefreshIcon />
    </KIcon>
  </div>
</template>
