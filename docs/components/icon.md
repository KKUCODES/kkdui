<script setup lang="ts">
import BasicIconDemo from "../examples/icon/BasicIconDemo.vue";
import BasicIconSource from "../examples/icon/BasicIconDemo.vue?raw";
import IconGallery from "../.vitepress/theme/components/IconGallery.vue";
</script>

# Icon 图标

KKDUI 使用独立 SVG Vue 组件承载图标。图标通过 `kkdui/icons` 按需导入，并使用 `currentColor` 继承文本或组件颜色。

## 基础用法

使用 `KIcon` 统一控制尺寸、颜色和无障碍标签。

<DemoBlock :code="BasicIconSource">
  <BasicIconDemo />
</DemoBlock>

```vue
<script setup>
import { KIcon } from "kkdui";
import { SearchIcon } from "kkdui/icons";
</script>

<template>
  <KIcon :size="20" color="#257360" label="搜索">
    <SearchIcon />
  </KIcon>
</template>
```

## 图标集合

点击图标可以复制对应的导入代码。

<ClientOnly>
  <IconGallery />
</ClientOnly>

## KIcon API

### Props

| 属性    | 说明                       | 类型               | 默认值       |
| ------- | -------------------------- | ------------------ | ------------ |
| `size`  | 图标宽高，数字按像素处理   | `string \| number` | `"1em"`      |
| `color` | 图标颜色                   | `string`           | 继承文本颜色 |
| `label` | 有语义图标的无障碍说明文字 | `string`           | —            |

### Slots

| 插槽      | 说明             |
| --------- | ---------------- |
| `default` | SVG Vue 图标组件 |

装饰性图标不传 `label`，`KIcon` 会自动设置 `aria-hidden="true"`；表达独立含义时应提供明确的 `label`。
