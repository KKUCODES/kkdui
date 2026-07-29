<script setup lang="ts">
import { ref } from "vue";
import {
  KAlertDialog,
  KBadge,
  KButton,
  KCheckbox,
  KCombobox,
  KCopyButton,
  KCursorPagination,
  KDateRangePicker,
  KDescriptions,
  KDialog,
  KDiffViewer,
  KDrawer,
  KDropdownMenu,
  KEmptyState,
  KErrorState,
  KFormItem,
  KFormSection,
  KInput,
  KLoadingState,
  KLogViewer,
  KMultiSelect,
  KNumberInput,
  KPagination,
  KPopover,
  KProgress,
  KRadioGroup,
  KRefreshControl,
  KSegmentedControl,
  KSelect,
  KStatCard,
  KSteps,
  KSwitch,
  KTable,
  KTabs,
  KTagInput,
  KTextarea,
  KTimeline,
  KToastProvider,
  KTooltip,
  KTree,
} from "../../../../src";
import type { ComponentDocSlug } from "../../componentDocs";
import ToastDemoActions from "./ToastDemoActions.vue";

defineProps<{ slug: ComponentDocSlug }>();

const text = ref("风控命中后，请填写处理说明。");
const numberValue = ref<number | null>(30);
const radioValue = ref<string | number | null>("all");
const segmentValue = ref<string | number | null>("realtime");
const selectValue = ref<string | number | null>("enabled");
const comboValue = ref<string | number | null>(null);
const multiValue = ref<Array<string | number>>(["risk"]);
const tags = ref(["prod", "asia"]);
const dateRange = ref({ start: "2026-07-01", end: "2026-07-29" });
const checked = ref(true);
const switched = ref(true);
const sectionCollapsed = ref(false);
const page = ref(2);
const pageSize = ref(20);
const currentTab = ref<string | number | null>("overview");
const selectedRows = ref<Array<string | number>>([1]);
const tableSort = ref<{ key: string; direction: "asc" | "desc" } | null>(null);
const checkedTreeKeys = ref<Array<string | number>>(["user.read"]);
const expandedTreeKeys = ref<Array<string | number>>(["user"]);
const treeSearch = ref("");
const dialogOpen = ref(false);
const alertOpen = ref(false);
const drawerOpen = ref(false);
const refreshSeconds = ref<number | null>(null);
const refreshPaused = ref(false);

const options = [
  { label: "全部状态", value: "all" },
  { label: "已启用", value: "enabled" },
  { label: "已停用", value: "disabled" },
];
const searchOptions = [
  { label: "管理员 KK", value: 1, description: "kk@example.com" },
  { label: "审核员 Lin", value: 2, description: "lin@example.com" },
  { label: "访客账号", value: 3, disabled: true },
];
const multiOptions = [
  { label: "风控", value: "risk" },
  { label: "财务", value: "finance" },
  { label: "客服", value: "service" },
];
const tableColumns = [
  { key: "name", title: "账号", sortable: true },
  { key: "role", title: "角色" },
  { key: "status", title: "状态" },
];
const tableRows = [
  { id: 1, name: "admin_kk", role: "超级管理员", status: "在线" },
  { id: 2, name: "auditor_lin", role: "审核员", status: "离线" },
  { id: 3, name: "service_01", role: "客服", status: "在线" },
];
const tabItems = [
  { value: "overview", label: "概览" },
  { value: "records", label: "操作记录", badge: 12 },
  { value: "permissions", label: "权限" },
];
const treeNodes = [
  {
    key: "user",
    label: "用户管理",
    children: [
      { key: "user.read", label: "查看用户" },
      { key: "user.write", label: "编辑用户" },
    ],
  },
  {
    key: "risk",
    label: "风控中心",
    children: [
      { key: "risk.read", label: "查看告警" },
      { key: "risk.handle", label: "处理告警" },
    ],
  },
];
const descriptionItems = [
  { key: "id", label: "管理员 ID", value: "ADM-2048", copyable: true },
  { key: "role", label: "角色", value: "超级管理员" },
  { key: "status", label: "状态", value: "已启用", status: "success" },
  { key: "login", label: "最近登录", value: "2026-07-29 15:42" },
];
const timelineItems = [
  {
    key: 1,
    title: "配置发布成功",
    description: "风控阈值已同步至全部节点",
    timestamp: "16:20",
    actor: "KK",
    tone: "success" as const,
  },
  {
    key: 2,
    title: "提交发布申请",
    timestamp: "16:12",
    actor: "Lin",
    tone: "accent" as const,
  },
];
const menuItems = [
  { key: "edit", label: "编辑账号", description: "修改基本资料" },
  {
    key: "disable",
    label: "停用账号",
    description: "需要二次确认",
    requiresConfirmation: true,
    danger: true,
    separatorBefore: true,
  },
];
const stepItems = [
  { value: "submit", title: "提交申请", status: "complete" as const },
  { value: "review", title: "安全审核", status: "current" as const },
  { value: "publish", title: "发布配置", status: "pending" as const },
];
const logEntries = [
  {
    id: 1,
    timestamp: "16:20:01",
    level: "info" as const,
    source: "gateway",
    message: "configuration reload started",
  },
  {
    id: 2,
    timestamp: "16:20:02",
    level: "success" as const,
    source: "gateway",
    message: "configuration reload completed",
  },
  {
    id: 3,
    timestamp: "16:20:04",
    level: "warning" as const,
    source: "worker-03",
    message: "queue usage reached 78%",
  },
];
</script>

<template>
  <div class="catalog-demo">
    <KTextarea
      v-if="slug === 'textarea'"
      v-model="text"
      :maxlength="120"
      show-count
      auto-resize
      placeholder="填写处理说明"
    />

    <KNumberInput
      v-else-if="slug === 'number-input'"
      v-model="numberValue"
      :min="0"
      :max="100"
      :step="5"
    />

    <KRadioGroup
      v-else-if="slug === 'radio-group'"
      v-model="radioValue"
      :options="options"
      aria-label="账号状态"
    />

    <KSegmentedControl
      v-else-if="slug === 'segmented-control'"
      v-model="segmentValue"
      :options="[
        { label: '实时', value: 'realtime' },
        { label: '小时', value: 'hour' },
        { label: '天', value: 'day' },
      ]"
      aria-label="统计粒度"
    />

    <KSelect
      v-else-if="slug === 'select'"
      v-model="selectValue"
      :options="options"
      clearable
      placeholder="选择账号状态"
    />

    <KCombobox
      v-else-if="slug === 'combobox'"
      v-model="comboValue"
      :options="searchOptions"
      clearable
      placeholder="搜索管理员"
    />

    <KMultiSelect
      v-else-if="slug === 'multi-select'"
      v-model="multiValue"
      :options="multiOptions"
      clearable
      filterable
      placeholder="选择负责团队"
    />

    <KTagInput
      v-else-if="slug === 'tag-input'"
      v-model="tags"
      :max-tags="5"
      placeholder="输入标签后回车"
    />

    <KDateRangePicker
      v-else-if="slug === 'date-range-picker'"
      v-model="dateRange"
      show-shortcuts
      clearable
    />

    <div v-else-if="slug === 'checkbox'" class="demo-column">
      <KCheckbox
        v-model="checked"
        label="允许导出数据"
        description="仅对当前角色开放导出能力"
      />
      <KCheckbox :model-value="true" indeterminate label="部分权限已选择" />
    </div>

    <div v-else-if="slug === 'switch'" class="demo-column">
      <KSwitch
        v-model="switched"
        label="自动刷新"
        description="每 30 秒刷新一次当前页面"
      />
      <KSwitch :model-value="true" loading label="正在保存" />
    </div>

    <KFormItem
      v-else-if="slug === 'form-item'"
      label="管理员名称"
      control-id="admin-name"
      hint="用于后台展示，最多 20 个字符"
      :current-length="6"
      :max-length="20"
      required
    >
      <KInput id="admin-name" model-value="审核员 KK" />
    </KFormItem>

    <KFormSection
      v-else-if="slug === 'form-section'"
      v-model:collapsed="sectionCollapsed"
      title="安全设置"
      description="管理登录验证与会话策略"
      collapsible
    >
      <div class="demo-column">
        <KSwitch :model-value="true" label="启用双重验证" />
        <KInput model-value="30" />
      </div>
    </KFormSection>

    <KTable
      v-else-if="slug === 'table'"
      v-model:sort="tableSort"
      v-model:selected-row-keys="selectedRows"
      :columns="tableColumns"
      :rows="tableRows"
      row-key="id"
      selectable
      caption="管理员账号列表"
    />

    <KPagination
      v-else-if="slug === 'pagination'"
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="186"
    />

    <KCursorPagination
      v-else-if="slug === 'cursor-pagination'"
      has-previous
      has-next
      batch-label="第 3 批 · 每批 50 条"
    />

    <KTabs v-else-if="slug === 'tabs'" v-model="currentTab" :items="tabItems">
      <template #panel-overview>账号运行正常，暂无异常告警。</template>
      <template #panel-records>最近 7 天共记录 12 次操作。</template>
      <template #panel-permissions>拥有用户查看与配置发布权限。</template>
    </KTabs>

    <div v-else-if="slug === 'badge'" class="demo-row">
      <KBadge tone="success">已启用</KBadge>
      <KBadge tone="warning">待审核</KBadge>
      <KBadge status="online" live>服务在线</KBadge>
      <KBadge status="connecting" live>连接中</KBadge>
    </div>

    <KDropdownMenu
      v-else-if="slug === 'dropdown-menu'"
      :items="menuItems"
      trigger-label="账号操作"
    />

    <KTree
      v-else-if="slug === 'tree'"
      v-model:checked-keys="checkedTreeKeys"
      v-model:expanded-keys="expandedTreeKeys"
      v-model:search="treeSearch"
      :nodes="treeNodes"
      checkable
      searchable
      show-toolbar
      aria-label="权限树"
    />

    <KDescriptions
      v-else-if="slug === 'descriptions'"
      :items="descriptionItems"
      :columns="{ mobile: 1, tablet: 2, desktop: 2 }"
      bordered
    />

    <KTimeline
      v-else-if="slug === 'timeline'"
      :items="timelineItems"
      pending
      pending-text="等待节点同步"
    />

    <KTooltip
      v-else-if="slug === 'tooltip'"
      content="只有超级管理员可以修改此配置"
    >
      <KButton variant="secondary">悬停查看说明</KButton>
    </KTooltip>

    <KPopover
      v-else-if="slug === 'popover'"
      title="账号信息"
      description="最近登录于 10 分钟前"
    >
      <template #trigger>
        <KButton variant="secondary">查看详情</KButton>
      </template>
      当前账号状态正常，没有未处理的安全告警。
    </KPopover>

    <div v-else-if="slug === 'copy-button'" class="demo-row">
      <code>ADM-2048-XY</code>
      <KCopyButton value="ADM-2048-XY" label="复制管理员 ID" />
    </div>

    <div v-else-if="slug === 'dialog'" class="demo-row">
      <KButton @click="dialogOpen = true">打开对话框</KButton>
      <KDialog
        v-model="dialogOpen"
        title="编辑管理员"
        description="修改账号的基础资料与角色。"
      >
        <KFormItem label="管理员名称">
          <KInput model-value="审核员 KK" />
        </KFormItem>
        <template #footer>
          <KButton variant="secondary" @click="dialogOpen = false">
            取消
          </KButton>
          <KButton @click="dialogOpen = false">保存</KButton>
        </template>
      </KDialog>
    </div>

    <div v-else-if="slug === 'alert-dialog'" class="demo-row">
      <KButton variant="danger" @click="alertOpen = true">停用账号</KButton>
      <KAlertDialog
        v-model="alertOpen"
        title="确认停用账号？"
        description="停用后该管理员将立即退出所有会话。"
        tone="danger"
        confirm-text="确认停用"
        show-reason
        @confirm="alertOpen = false"
      />
    </div>

    <div v-else-if="slug === 'drawer'" class="demo-row">
      <KButton @click="drawerOpen = true">打开抽屉</KButton>
      <KDrawer
        v-model="drawerOpen"
        title="账号详情"
        description="查看账号状态和最近操作"
        :width="480"
      >
        <KDescriptions :items="descriptionItems" :columns="1" />
        <template #footer>
          <KButton variant="secondary" @click="drawerOpen = false">
            关闭
          </KButton>
        </template>
      </KDrawer>
    </div>

    <KToastProvider v-else-if="slug === 'toast'">
      <ToastDemoActions />
    </KToastProvider>

    <div v-else-if="slug === 'stat-card'" class="catalog-demo__cards">
      <KStatCard label="在线用户" :value="1286" :change="12.4" unit="人" />
      <KStatCard label="风险告警" :value="23" :change="-8.2" tone="warning" />
    </div>

    <div v-else-if="slug === 'progress'" class="demo-column">
      <KProgress :value="64" label="连接池" tone="primary" />
      <KProgress :value="82" label="队列容量" tone="warning" />
      <KProgress :value="35" label="任务进度" tone="success" show-value />
    </div>

    <KSteps
      v-else-if="slug === 'steps'"
      model-value="review"
      :items="stepItems"
    />

    <KRefreshControl
      v-else-if="slug === 'refresh-control'"
      v-model="refreshSeconds"
      v-model:paused="refreshPaused"
      :options="[15, 30, 60]"
      :last-updated="new Date()"
    />

    <KLogViewer
      v-else-if="slug === 'log-viewer'"
      :entries="logEntries"
      :height="240"
    />

    <KDiffViewer
      v-else-if="slug === 'diff-viewer'"
      :before="{ enabled: false, threshold: 70, region: 'asia' }"
      :after="{ enabled: true, threshold: 85, region: 'asia' }"
      mode="json"
      :max-height="280"
    />

    <KLoadingState
      v-else-if="slug === 'loading-state'"
      title="正在加载管理员列表"
      description="正在同步最新数据，请稍候。"
      :rows="4"
    />

    <KEmptyState
      v-else-if="slug === 'empty-state'"
      title="暂无管理员"
      description="创建第一个管理员账号后，数据会显示在这里。"
      action-text="创建管理员"
    />

    <KErrorState
      v-else-if="slug === 'error-state'"
      title="管理员列表加载失败"
      description="网络连接异常，请检查后重试。"
      retry-text="重新加载"
    />
  </div>
</template>
