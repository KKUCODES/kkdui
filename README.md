# KKDUI

KK 的 Vue 3 UI 组件库，为后台管理系统而设计。组件只依赖 Vue，不依赖路由、状态管理、具体业务或图表库。

[在线文档](https://kkucodes.github.io/kkdui/) · [npm](https://www.npmjs.com/package/kkdui) · [GitHub](https://github.com/KKUCODES/kkdui)

## 安装

```bash
npm install kkdui
```

```ts
import { KButton, KInput } from "kkdui";
import { SearchIcon } from "kkdui/icons";
import "kkdui/style.css";
```

## 当前组件

基础组件：

- `KIcon`：统一 SVG 图标的尺寸、颜色和无障碍语义。
- 图标通过 `kkdui/icons` 按需导入，现有组件内部也复用同一套图标。

表单与筛选：

- `KButton`：按钮的样式、尺寸、加载、禁用和按压反馈。
- `KInput`：输入框、密码显示、前后缀插槽和原生属性透传。
- `KTextarea`：多行文本、自动高度、字数限制/计数和错误状态。
- `KNumberInput`：步进、边界、精度和非法/超大数值保护。
- `KRadioGroup`：带描述和禁用状态的横向或纵向单选配置。
- `KSegmentedControl`：状态、模式等少量互斥选项的紧凑切换。
- `KSelect`：单值选项筛选、清除、禁用项和原始值类型保持。
- `KCombobox`：可搜索单选、本地或远程搜索及异步状态。
- `KMultiSelect`：多值搜索、清除和已选项折叠。
- `KTagInput`：标签录入、批量粘贴、去重与格式校验。
- `KDateRangePicker`：日期范围、常用快捷项、时区、最大跨度和统计粒度联动。
- `KCheckbox`：权限勾选、半选、禁用与错误状态。
- `KSwitch`：布尔状态切换和异步提交中的 loading 锁定。
- `KFormItem`：标签说明、多个错误、字数/限制提示和表单错误定位。
- `KFormSection`：复杂表单的标题、说明、操作区及可折叠分区。

数据与导航：

- `KTable`：泛型列、排序与跨页选择、展开行、固定列、列可见性、行状态、列头提示、统一空值和 `medium / small` 信息密度。
- `KPagination`：受控页码与页容量、智能页码折叠、`medium / small` 信息密度、总数区间和移动端触控布局。
- `KCursorPagination`：不依赖总记录数的上一批/下一批游标分页。
- `KTabs`：键盘导航、异步状态、徽标、横向滚动及移动端下拉降级。
- `KBadge`：业务状态、图标、长文本及在线/离线/连接中的低干扰反馈。
- `KDropdownMenu`：图标、描述、分组、禁用原因、异步操作及二次确认衔接。

详情与结构：

- `KTree`：权限树的展开、复选/半选、父子联动、搜索、全选和全部展开。
- `KDescriptions`：响应式键值详情、复制和状态插槽。
- `KTimeline`：登录、牌局、风控和配置发布等事件记录。
- `KTooltip` / `KPopover`：字段说明、截断内容及轻量快捷操作。
- `KCopyButton`：统一复制游客 ID、房间 ID、IP 等字段并反馈结果。

弹层与反馈：

- `KDialog`：未保存拦截、移动端全屏、固定操作区、外部表单提交和长表单滚动。
- `KAlertDialog`：指定文字、操作原因、风险详情和可选确认倒计时。
- `KDrawer`：移动端全屏、固定操作区、未保存拦截、可拖拽宽度及内部数据状态。
- `KToast`：更新现有通知、Promise 状态、持久通知、任务进度和同类错误去重。
- `KToastProvider` / `useKToast`：应用级通知队列及命令式调用。

状态、流程与运维：

- `KStatCard`：指标值、单位、趋势、同比以及加载/错误状态。
- `KProgress`：连接池、CPU、内存、队列容量和风险评分。
- `KSteps`：审批、发布与风控处理流程。
- `KRefreshControl`：手动刷新、自动刷新、暂停及最后更新时间。
- `KLogViewer`：日志等级、搜索、复制、自动滚动/暂停和虚拟滚动。
- `KDiffViewer`：文本或配置变更的新增、删除与修改高亮。

页面级数据状态：

- `KLoadingState`：与内容布局一致的骨架状态。
- `KEmptyState`：包含下一步操作的空状态。
- `KErrorState`：可访问的错误说明和重试操作。

所有组件和 TypeScript 类型统一从 `kkdui` 导入。

选择类组件按意图拆分：固定单选用 `KRadioGroup`，少量模式切换用
`KSegmentedControl`，普通下拉用 `KSelect`，可搜索单选用 `KCombobox`，
多值筛选用 `KMultiSelect`，不通过一个组件的视觉变体混用。

## 发布

`main` 分支使用 GitHub Actions 和 semantic-release 自动测试、构建、生成版本并发布 npm：

- `fix:` 触发补丁版本，例如 `0.1.0` → `0.1.1`。
- `feat:` 触发次版本，例如 `0.1.0` → `0.2.0`。
- `BREAKING CHANGE:` 或带 `!` 的提交触发主版本。
- `docs:`、`test:`、`chore:`、`ci:` 默认不发布。

npm 发布通过 GitHub OIDC Trusted Publishing 完成，不在仓库中保存 npm token。

## 受控状态约定

筛选、弹层和导航状态统一使用 Vue `v-model`，业务层保留数据与请求控制权：

```vue
<KSelect v-model="status" :options="statusOptions" clearable />
<KDateRangePicker v-model="dateRange" type="datetime-local" />
<KDialog v-model="createDialogOpen" title="创建管理员">
  <!-- 表单 -->
</KDialog>
<KDrawer v-model="visitorDrawerOpen" title="游客详情">
  <KTabs v-model="detailTab" :items="detailTabs" />
</KDrawer>
```

`KAlertDialog` 点击确认时只发送 `confirm`，不会自动关闭。业务层应等待危险操作成功后再关闭，失败时保留现场供用户重试。

## 表格与分页

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  KTable,
  type KTableColumn,
  type KTableRowKey,
  type KTableSort
} from "kkdui";

interface UserRow {
  id: number;
  name: string;
  status: string;
}

const columns: KTableColumn<UserRow>[] = [
  { key: "name", title: "姓名", accessor: "name", sortable: true },
  { key: "status", title: "状态", accessor: "status" }
];
const rows = ref<UserRow[]>([]);
const sort = ref<KTableSort | null>(null);
const selectedRowKeys = ref<KTableRowKey[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
</script>

<template>
  <div class="list-stack">
    <KTable
      v-model:sort="sort"
      v-model:selected-row-keys="selectedRowKeys"
      :columns="columns"
      :rows="rows"
      row-key="id"
      size="small"
      selectable
    >
      <template #cell-status="{ row }">
        {{ row.status }}
      </template>
    </KTable>

    <KPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="total"
      size="small"
    />
  </div>
</template>
```

分页组件只描述分页状态。业务层监听 `page`、`pageSize` 和 `sort` 的变化后重新请求数据，并把结果传给 `KTable`；两者不会直接依赖彼此。

## Toast

应用根节点已安装 `KToastProvider`，页面和业务组件通过组合式 API 调用：

```ts
import { useKToast } from "kkdui";

const toast = useKToast();

toast.success("管理员已创建");
toast.danger("保存失败", {
  description: "请检查网络连接后重试。"
});
toast.info("会话已撤销", {
  actionLabel: "恢复",
  onAction: restoreSession
});

const task = saveConfiguration();
await toast.promise(task, {
  loading: "正在保存配置",
  success: "配置已保存",
  error: (error) => ({
    title: "保存失败",
    description: getErrorMessage(error),
    tone: "danger",
    dedupeKey: "save-configuration"
  })
});
```

## 页面数据流

页面按固定优先级渲染状态，避免空数组掩盖请求错误：

```vue
<KLoadingState v-if="loading" />
<KErrorState v-else-if="error" :description="error" @retry="loadData" />
<KEmptyState
  v-else-if="rows.length === 0"
  title="暂无管理员"
  action-text="创建管理员"
  @action="createDialogOpen = true"
/>
<AdminList v-else :rows="rows" />
```

## 设计覆盖

组件通过 `--k-*` CSS 变量接收主题，不直接依赖应用级样式：

```css
:root {
  --k-color-primary: #257360;
  --k-color-primary-hover: #1e604f;
  --k-color-text: #1d2725;
  --k-radius-control: 0.78rem;
  --k-z-dropdown: 1020;
  --k-z-drawer: 1080;
  --k-z-dialog: 1100;
  --k-z-toast: 1200;
}
```

公开 API 保持业务无关。弹层遵循同路径进入和退出、即时按压反馈与焦点恢复；所有动态组件均提供 reduced-motion、reduced-transparency 或高对比度降级。
