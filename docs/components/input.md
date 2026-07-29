<script setup lang="ts">
import BasicInputDemo from "../examples/input/BasicInputDemo.vue";
import BasicInputSource from "../examples/input/BasicInputDemo.vue?raw";
import InputStateDemo from "../examples/input/InputStateDemo.vue";
import InputStateSource from "../examples/input/InputStateDemo.vue?raw";
</script>

# Input 输入框

用于录入短文本。组件通过 `v-model` 保持输入值受控，并将大多数原生 input 属性透传到内部控件。

## 基础用法

<DemoBlock :code="BasicInputSource">
  <BasicInputDemo />
</DemoBlock>

## 密码与状态

密码输入可以开启显示切换。校验失败使用 `invalid`，不可操作状态使用 `disabled`。

<DemoBlock :code="InputStateSource">
  <InputStateDemo />
</DemoBlock>

## API

### Props

| 属性         | 说明                        | 类型                                                                                | 默认值     |
| ------------ | --------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| `modelValue` | 输入值，通过 `v-model` 使用 | `string`                                                                            | `""`       |
| `id`         | 内部 input 的 ID            | `string`                                                                            | 自动生成   |
| `type`       | 输入类型                    | `"text" \| "password" \| "email" \| "search" \| "tel" \| "url" \| "datetime-local"` | `"text"`   |
| `size`       | 输入框尺寸                  | `"small" \| "medium" \| "large"`                                                    | `"medium"` |
| `invalid`    | 是否处于校验失败状态        | `boolean`                                                                           | `false`    |
| `disabled`   | 是否禁用                    | `boolean`                                                                           | `false`    |
| `readonly`   | 是否只读                    | `boolean`                                                                           | `false`    |
| `revealable` | 密码是否允许显示与隐藏      | `boolean`                                                                           | `false`    |

### Events

| 事件                | 说明                | 参数                  |
| ------------------- | ------------------- | --------------------- |
| `update:modelValue` | 输入值改变          | `(value: string)`     |
| `focus`             | 内部 input 获得焦点 | `(event: FocusEvent)` |
| `blur`              | 内部 input 失去焦点 | `(event: FocusEvent)` |

### Slots

| 插槽     | 说明                                 |
| -------- | ------------------------------------ |
| `prefix` | 输入框前缀                           |
| `suffix` | 输入框后缀；密码显示按钮启用时不展示 |
