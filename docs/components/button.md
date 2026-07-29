<script setup lang="ts">
import BasicButtonDemo from "../examples/button/BasicButtonDemo.vue";
import BasicButtonSource from "../examples/button/BasicButtonDemo.vue?raw";
import ButtonStateDemo from "../examples/button/ButtonStateDemo.vue";
import ButtonStateSource from "../examples/button/ButtonStateDemo.vue?raw";
</script>

# Button 按钮

用于触发即时操作。一个操作区域中应优先只有一个主要按钮，危险操作使用明确的危险样式。

## 基础用法

使用 `variant` 表达操作层级，使用 `size` 适配界面密度。

<DemoBlock :code="BasicButtonSource">
  <BasicButtonDemo />
</DemoBlock>

## 加载与禁用

加载状态会阻止重复点击，并通过 `aria-busy` 向辅助技术表达处理中状态。

<DemoBlock :code="ButtonStateSource">
  <ButtonStateDemo />
</DemoBlock>

## API

### Props

| 属性       | 说明                      | 类型                                              | 默认值      |
| ---------- | ------------------------- | ------------------------------------------------- | ----------- |
| `variant`  | 操作层级                  | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` |
| `size`     | 按钮尺寸                  | `"small" \| "medium" \| "large"`                  | `"medium"`  |
| `type`     | 原生按钮类型              | `"button" \| "submit" \| "reset"`                 | `"button"`  |
| `loading`  | 是否处于加载状态          | `boolean`                                         | `false`     |
| `disabled` | 是否禁用                  | `boolean`                                         | `false`     |
| `block`    | 是否占满容器宽度          | `boolean`                                         | `false`     |
| `icon`     | 内容前的 SVG Vue 图标组件 | `Component`                                       | —           |

### Events

| 事件    | 说明                 | 参数                  |
| ------- | -------------------- | --------------------- |
| `click` | 可操作状态下点击按钮 | `(event: MouseEvent)` |

### Slots

| 插槽       | 说明                           |
| ---------- | ------------------------------ |
| `default`  | 按钮文字或主要内容             |
| `icon`     | 内容前图标，优先于 `icon` 属性 |
| `leading`  | 内容前区域                     |
| `trailing` | 内容后区域                     |
