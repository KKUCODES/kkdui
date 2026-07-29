# 快速开始

KKDUI 是面向 Vue 3 后台管理系统的通用组件库。核心组件只依赖 Vue，不绑定路由、状态管理或图表库。

## 安装

使用项目现有的包管理器安装：

::: code-group

```bash [npm]
npm install kkdui
```

```bash [pnpm]
pnpm add kkdui
```

```bash [yarn]
yarn add kkdui
```

:::

## 引入样式

在应用入口中引入一次基础变量与组件样式：

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "kkdui/style.css";

createApp(App).mount("#app");
```

## 使用组件

KKDUI 当前推荐按需导入组件，未使用的组件可以由构建工具移除：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { KButton, KInput } from "kkdui";

const keyword = ref("");
</script>

<template>
  <KInput v-model="keyword" placeholder="输入用户名或 ID" />
  <KButton @click="console.log(keyword)">查询</KButton>
</template>
```

## 更新版本

KKDUI 发布新版本后，在业务项目中明确升级依赖：

```bash
npm install kkdui@latest
```

同时提交 `package.json` 和锁文件，确保本地、CI 与生产环境使用同一版本。

## 环境要求

| 依赖       | 版本                                |
| ---------- | ----------------------------------- |
| Vue        | `^3.5.0`                            |
| TypeScript | 推荐 `5.5+`                         |
| 浏览器     | 支持现代 CSS 与 ES2022 的现代浏览器 |
