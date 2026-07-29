interface ApiItem {
  readonly name: string;
  readonly description: string;
  readonly type: string;
  readonly default?: string;
}

interface EventItem {
  readonly name: string;
  readonly description: string;
  readonly payload: string;
}

interface ComponentDoc {
  readonly usage: string;
  readonly code: string;
  readonly api: readonly ApiItem[];
  readonly events?: readonly EventItem[];
}

const item = (
  name: string,
  description: string,
  type: string,
  defaultValue?: string,
): ApiItem => ({ name, description, type, default: defaultValue });

const event = (
  name: string,
  description: string,
  payload: string,
): EventItem => ({ name, description, payload });

export const componentDocs = {
  textarea: {
    usage: "适合备注、说明和审核意见等多行文本，可自动调整高度并显示字数。",
    code: `<KTextarea
  v-model="description"
  :maxlength="120"
  show-count
  auto-resize
  placeholder="填写处理说明"
/>`,
    api: [
      item("v-model", "文本内容", "string", '""'),
      item("rows", "基础行数", "number", "3"),
      item("autoResize", "是否根据内容自动增高", "boolean", "false"),
      item("maxlength", "最大字符数", "number"),
      item("showCount", "是否展示字数", "boolean", "false"),
      item("invalid", "是否处于错误状态", "boolean", "false"),
    ],
    events: [
      event("focus", "获得焦点", "FocusEvent"),
      event("blur", "失去焦点", "FocusEvent"),
    ],
  },
  "number-input": {
    usage: "用于数量、比例和阈值等数值录入，统一处理边界、步进和精度。",
    code: `<KNumberInput
  v-model="threshold"
  :min="0"
  :max="100"
  :step="5"
/>`,
    api: [
      item("v-model", "当前数值", "number | null", "null"),
      item("min / max", "允许的最小值和最大值", "number"),
      item("step", "每次增减的步长", "number", "1"),
      item("precision", "小数精度", "number"),
      item("controls", "是否显示步进按钮", "boolean", "true"),
      item("invalid", "是否处于错误状态", "boolean", "false"),
    ],
    events: [
      event("change", "有效数值发生改变", "number | null"),
      event("invalidInput", "输入无法转换为有效数值", "string"),
    ],
  },
  "radio-group": {
    usage: "用于从少量互斥选项中选择一个值，选项可以带描述和禁用状态。",
    code: `<KRadioGroup
  v-model="status"
  :options="statusOptions"
  aria-label="账号状态"
/>`,
    api: [
      item("v-model", "当前选中值", "string | number | null", "null"),
      item("options", "单选项列表", "KRadioOption[]"),
      item(
        "direction",
        "排列方向",
        '"horizontal" | "vertical"',
        '"horizontal"',
      ),
      item("size", "控件尺寸", '"small" | "medium" | "large"', '"medium"'),
      item("disabled", "是否整体禁用", "boolean", "false"),
    ],
    events: [event("change", "选中值改变", "value, Event")],
  },
  "segmented-control": {
    usage: "适合实时、小时、天等少量模式切换，视觉层级比单选组更紧凑。",
    code: `<KSegmentedControl
  v-model="granularity"
  :options="granularityOptions"
  aria-label="统计粒度"
/>`,
    api: [
      item("v-model", "当前选中值", "string | number | null", "null"),
      item("options", "分段选项", "KSegmentedOption[]"),
      item("size", "控件尺寸", '"small" | "medium" | "large"', '"medium"'),
      item("fullWidth", "是否占满容器", "boolean", "false"),
      item("disabled", "是否禁用", "boolean", "false"),
    ],
    events: [event("change", "选中值改变", "string | number")],
  },
  select: {
    usage: "用于固定选项的普通单选，保留 string 或 number 原始值类型。",
    code: `<KSelect
  v-model="status"
  :options="statusOptions"
  clearable
  placeholder="选择账号状态"
/>`,
    api: [
      item("v-model", "当前选中值", "string | number | null", "null"),
      item("options", "选项列表", "KSelectOption[]"),
      item("placeholder", "未选择时的提示", "string", '"请选择"'),
      item("clearable", "是否允许清空", "boolean", "false"),
      item("invalid", "是否处于错误状态", "boolean", "false"),
    ],
    events: [
      event("change", "选中值改变", "value, Event"),
      event("clear", "清空选中值", "void"),
    ],
  },
  combobox: {
    usage: "用于可搜索单选，支持本地过滤和远程异步搜索。",
    code: `<KCombobox
  v-model="adminId"
  :options="admins"
  clearable
  placeholder="搜索管理员"
/>`,
    api: [
      item("v-model", "当前选中值", "string | number | null", "null"),
      item("options", "可选项", "KComboboxOption[]"),
      item("remote", "是否启用远程搜索", "boolean", "false"),
      item("remoteMethod", "远程搜索函数", "(query) => Promise<Option[]>"),
      item("loading", "是否正在加载", "boolean", "false"),
      item("clearable", "是否允许清空", "boolean", "false"),
    ],
    events: [
      event("search", "搜索词改变", "string"),
      event("change", "选中值改变", "string | number | null"),
      event("loadError", "远程搜索失败", "unknown"),
    ],
  },
  "multi-select": {
    usage: "用于多值筛选，支持搜索、标签折叠与清空。",
    code: `<KMultiSelect
  v-model="teams"
  :options="teamOptions"
  filterable
  clearable
/>`,
    api: [
      item("v-model", "已选值列表", "(string | number)[]", "[]"),
      item("options", "可选项", "KMultiSelectOption[]"),
      item("filterable", "是否允许搜索", "boolean", "false"),
      item("collapseTags", "是否折叠已选标签", "boolean", "false"),
      item("maxTagCount", "折叠前最多展示标签数", "number", "2"),
      item("clearable", "是否允许清空", "boolean", "false"),
    ],
    events: [
      event("change", "已选值改变", "(string | number)[]"),
      event("search", "搜索词改变", "string"),
    ],
  },
  "tag-input": {
    usage: "用于标签、白名单和关键词录入，支持批量粘贴、去重与格式校验。",
    code: `<KTagInput
  v-model="tags"
  :max-tags="5"
  placeholder="输入标签后回车"
/>`,
    api: [
      item("v-model", "当前标签", "string[]", "[]"),
      item("maxTags", "最多标签数", "number"),
      item("maxTagLength", "单个标签最大长度", "number"),
      item("allowDuplicates", "是否允许重复", "boolean", "false"),
      item("pattern", "格式校验表达式", "RegExp"),
      item("validator", "自定义校验函数", "(value) => boolean | string"),
    ],
    events: [
      event("change", "标签列表改变", "string[]"),
      event("reject", "标签被拒绝", "KTagRejection[]"),
    ],
  },
  "date-range-picker": {
    usage: "用于日期或时间范围筛选，可附加快捷范围、时区和统计粒度。",
    code: `<KDateRangePicker
  v-model="range"
  show-shortcuts
  clearable
/>`,
    api: [
      item("v-model", "起止范围", "KDateRangeValue | null", "null"),
      item("type", "日期输入类型", '"date" | "datetime-local"', '"date"'),
      item("showShortcuts", "是否展示快捷范围", "boolean", "false"),
      item("maxSpanDays", "最大跨度天数", "number"),
      item("showTimeZone", "是否展示时区", "boolean", "false"),
      item("showGranularity", "是否展示统计粒度", "boolean", "false"),
    ],
    events: [
      event("change", "日期范围改变", "KDateRangeValue | null"),
      event("validationChange", "范围校验状态改变", "string"),
    ],
  },
  checkbox: {
    usage: "用于布尔选择、权限树半选和带说明的确认项。",
    code: `<KCheckbox
  v-model="canExport"
  label="允许导出数据"
  description="仅对当前角色开放导出能力"
/>`,
    api: [
      item("v-model", "是否选中", "boolean", "false"),
      item("label", "选项标题", "string"),
      item("description", "辅助说明", "string"),
      item("indeterminate", "是否显示半选", "boolean", "false"),
      item("invalid", "是否处于错误状态", "boolean", "false"),
      item("disabled", "是否禁用", "boolean", "false"),
    ],
    events: [event("change", "选中状态改变", "checked, Event")],
  },
  switch: {
    usage: "用于立即生效的开关状态，也支持异步保存中的 loading 锁定。",
    code: `<KSwitch
  v-model="autoRefresh"
  label="自动刷新"
  description="每 30 秒刷新一次当前页面"
/>`,
    api: [
      item("v-model", "开关状态", "boolean", "false"),
      item("label", "开关标题", "string"),
      item("description", "辅助说明", "string"),
      item("loading", "是否正在保存", "boolean", "false"),
      item("size", "控件尺寸", '"small" | "medium"', '"medium"'),
      item("disabled", "是否禁用", "boolean", "false"),
    ],
    events: [event("change", "状态改变", "checked, Event")],
  },
  "form-item": {
    usage: "统一表单标签、帮助信息、错误列表和字数限制。",
    code: `<KFormItem
  label="管理员名称"
  control-id="admin-name"
  hint="最多 20 个字符"
  required
>
  <KInput id="admin-name" v-model="name" />
</KFormItem>`,
    api: [
      item("label", "字段标签", "string"),
      item("controlId", "关联控件 ID", "string"),
      item("hint", "帮助信息", "string"),
      item("error / errors", "单个或多个错误", "string | string[]"),
      item("required", "是否标记必填", "boolean", "false"),
      item("currentLength / maxLength", "当前与最大字符数", "number"),
    ],
  },
  "form-section": {
    usage: "用于复杂表单分区，支持说明、操作区域和折叠状态。",
    code: `<KFormSection
  v-model:collapsed="collapsed"
  title="安全设置"
  description="管理登录验证与会话策略"
  collapsible
>
  <!-- fields -->
</KFormSection>`,
    api: [
      item("title", "分区标题", "string"),
      item("description", "分区说明", "string"),
      item("v-model:collapsed", "折叠状态", "boolean", "false"),
      item("collapsible", "是否允许折叠", "boolean", "false"),
      item("disabled", "是否禁用折叠", "boolean", "false"),
      item("headingLevel", "标题语义层级", "2 | 3 | 4 | 5", "3"),
    ],
    events: [event("toggle", "折叠状态改变", "boolean")],
  },
  table: {
    usage: "后台数据表格，支持排序、跨页选择、展开行、固定列和多种数据状态。",
    code: `<KTable
  v-model:sort="sort"
  v-model:selected-row-keys="selected"
  :columns="columns"
  :rows="rows"
  row-key="id"
  selectable
/>`,
    api: [
      item("columns", "列定义", "KTableColumn<TRow>[]"),
      item("rows", "行数据", "TRow[]"),
      item("rowKey", "行唯一键", "keyof TRow | (row) => key"),
      item("v-model:sort", "排序状态", "KTableSort | null"),
      item("v-model:selectedRowKeys", "已选行键", "(string | number)[]"),
      item("loading / error", "数据状态", "boolean / string"),
    ],
    events: [
      event("rowClick", "点击可交互行", "row, rowIndex"),
      event("retry", "请求重新加载", "void"),
    ],
  },
  pagination: {
    usage: "用于已知总记录数的页码分页，包含总数区间与页容量切换。",
    code: `<KPagination
  v-model:page="page"
  v-model:page-size="pageSize"
  :total="186"
/>`,
    api: [
      item("v-model:page", "当前页", "number"),
      item("v-model:pageSize", "每页数量", "number"),
      item("total", "总记录数", "number"),
      item("pageSizeOptions", "页容量选项", "number[]", "[10, 20, 50, 100]"),
      item("showTotal", "是否显示总数", "boolean", "true"),
      item("hideOnSinglePage", "单页时是否隐藏", "boolean", "false"),
    ],
  },
  "cursor-pagination": {
    usage: "用于不知道总记录数的游标分页，通过上一批和下一批事件加载数据。",
    code: `<KCursorPagination
  :has-previous="Boolean(previousCursor)"
  :has-next="Boolean(nextCursor)"
  batch-label="第 3 批 · 每批 50 条"
  @previous="loadPrevious"
  @next="loadNext"
/>`,
    api: [
      item("hasPrevious", "是否存在上一批", "boolean"),
      item("hasNext", "是否存在下一批", "boolean"),
      item("loading", "是否整体加载中", "boolean", "false"),
      item("previousLoading", "上一批加载状态", "boolean", "false"),
      item("nextLoading", "下一批加载状态", "boolean", "false"),
      item("batchLabel", "当前批次说明", "string"),
    ],
    events: [
      event("previous", "请求上一批", "void"),
      event("next", "请求下一批", "void"),
    ],
  },
  tabs: {
    usage: "用于同一对象下的内容分区，支持键盘导航、徽标和移动端选择模式。",
    code: `<KTabs v-model="activeTab" :items="tabs">
  <template #panel-overview>概览内容</template>
  <template #panel-records>操作记录</template>
</KTabs>`,
    api: [
      item("v-model", "当前分区值", "string | number | null", "null"),
      item("items", "分区项", "KTabItem[]"),
      item(
        "activation",
        "键盘激活方式",
        '"automatic" | "manual"',
        '"automatic"',
      ),
      item("stretch", "是否等宽拉伸", "boolean", "false"),
      item("unmountInactive", "是否卸载非活动面板", "boolean", "false"),
      item("mobileMode", "移动端模式", '"scroll" | "select"', '"scroll"'),
    ],
    events: [
      event("change", "活动分区改变", "string | number"),
      event("retry", "错误面板请求重试", "KTabItem"),
    ],
  },
  badge: {
    usage: "用于业务状态、数量和在线状态提示，支持低干扰的实时连接反馈。",
    code: `<KBadge tone="success">已启用</KBadge>
<KBadge tone="warning">待审核</KBadge>
<KBadge status="online" live>服务在线</KBadge>`,
    api: [
      item("tone", "视觉语义", "KBadgeTone", '"neutral"'),
      item("size", "徽标尺寸", '"small" | "medium"', '"medium"'),
      item("dot", "是否只显示圆点", "boolean", "false"),
      item("live", "是否显示实时状态点", "boolean", "false"),
      item("status", "连接状态", '"online" | "offline" | "connecting"'),
      item("wrap", "长文本是否换行", "boolean", "false"),
    ],
  },
  "dropdown-menu": {
    usage: "承载行级更多操作，支持说明、分组、禁用原因和危险操作。",
    code: `<KDropdownMenu
  :items="actions"
  trigger-label="账号操作"
  @select="handleAction"
  @confirm="openConfirmation"
/>`,
    api: [
      item("items", "菜单操作项", "KDropdownMenuItem[]"),
      item("v-model:open", "菜单打开状态", "boolean", "false"),
      item("align", "相对触发器对齐", '"start" | "end"', '"end"'),
      item("closeOnSelect", "选择后是否关闭", "boolean", "true"),
      item("minWidth", "菜单最小宽度", "string | number"),
      item("disabled", "是否禁用触发器", "boolean", "false"),
    ],
    events: [
      event("select", "选择普通操作", "KDropdownMenuItem"),
      event("confirm", "选择需确认操作", "KDropdownMenuItem"),
    ],
  },
  tree: {
    usage: "用于权限和层级数据，支持搜索、展开、父子联动复选与工具栏。",
    code: `<KTree
  v-model:checked-keys="checkedKeys"
  v-model:expanded-keys="expandedKeys"
  v-model:search="query"
  :nodes="permissionNodes"
  checkable
  searchable
  show-toolbar
/>`,
    api: [
      item("nodes", "树节点", "KTreeNode[]"),
      item("v-model:checkedKeys", "已选节点键", "KTreeKey[]", "[]"),
      item("v-model:expandedKeys", "已展开节点键", "KTreeKey[]", "[]"),
      item("v-model:search", "搜索词", "string", '""'),
      item("checkable", "是否允许复选", "boolean", "false"),
      item("checkStrictly", "是否取消父子联动", "boolean", "false"),
    ],
    events: [
      event("check", "复选状态改变", "keys, node"),
      event("expand", "展开状态改变", "keys, node"),
      event("select", "选择节点", "KTreeNode"),
    ],
  },
  descriptions: {
    usage: "用于账号、订单和配置详情的键值展示，支持响应式列数、状态与复制。",
    code: `<KDescriptions
  :items="detailItems"
  :columns="{ mobile: 1, tablet: 2, desktop: 2 }"
  bordered
/>`,
    api: [
      item("items", "详情项", "KDescriptionItem[]"),
      item("columns", "响应式列数", "number | KDescriptionsColumns", "2"),
      item("bordered", "是否显示边框", "boolean", "false"),
      item("emptyValue", "空值占位", "string", '"—"'),
      item("ariaLabel", "区域无障碍名称", "string", '"详情信息"'),
    ],
    events: [
      event("copy", "值复制成功", "item, value"),
      event("copyError", "值复制失败", "item, error"),
    ],
  },
  timeline: {
    usage: "用于登录、审批、风控和配置发布等事件记录。",
    code: `<KTimeline
  :items="events"
  pending
  pending-text="等待节点同步"
/>`,
    api: [
      item("items", "时间线事件", "KTimelineItem[]"),
      item("compact", "是否使用紧凑布局", "boolean", "false"),
      item("pending", "是否显示待完成节点", "boolean", "false"),
      item("pendingText", "待完成说明", "string", '"处理中"'),
      item("emptyText", "空状态文案", "string", '"暂无记录"'),
    ],
  },
  tooltip: {
    usage: "用于字段解释和截断内容，支持悬停、聚焦与延迟控制。",
    code: `<KTooltip content="只有超级管理员可以修改此配置">
  <KButton variant="secondary">悬停查看说明</KButton>
</KTooltip>`,
    api: [
      item("content", "提示内容", "string"),
      item("v-model:open", "打开状态", "boolean", "false"),
      item("placement", "首选位置", "KTooltipPlacement", '"auto"'),
      item("openDelay", "打开延迟毫秒", "number", "350"),
      item("closeDelay", "关闭延迟毫秒", "number", "100"),
      item("maxWidth", "最大宽度", "string | number"),
    ],
    events: [
      event("open", "提示打开", "void"),
      event("close", "提示关闭", "void"),
    ],
  },
  popover: {
    usage: "用于轻量详情和快捷操作，比 Tooltip 承载更丰富的结构。",
    code: `<KPopover title="账号信息" description="最近登录于 10 分钟前">
  <template #trigger>
    <KButton variant="secondary">查看详情</KButton>
  </template>
  当前账号状态正常。
</KPopover>`,
    api: [
      item("v-model:open", "打开状态", "boolean", "false"),
      item("title", "浮层标题", "string"),
      item("description", "标题说明", "string"),
      item("placement", "首选位置", "KPopoverPlacement", '"auto"'),
      item("align", "内容对齐", '"start" | "center" | "end"', '"center"'),
      item("width", "浮层宽度", "string | number"),
    ],
    events: [
      event("open", "浮层打开", "void"),
      event("close", "浮层关闭", "reason"),
    ],
  },
  "copy-button": {
    usage: "统一复制管理员 ID、订单号、IP 等字段，并提供成功与失败反馈。",
    code: `<KCopyButton
  value="ADM-2048-XY"
  label="复制管理员 ID"
  success-label="已复制"
/>`,
    api: [
      item("value", "待复制内容", "string | number"),
      item("label", "默认按钮文案", "string", '"复制"'),
      item("successLabel", "成功文案", "string", '"已复制"'),
      item("errorLabel", "失败文案", "string", '"复制失败"'),
      item("iconOnly", "是否仅显示图标", "boolean", "false"),
      item("resetDelay", "反馈重置延迟毫秒", "number", "1800"),
    ],
    events: [
      event("success", "复制成功", "string"),
      event("error", "复制失败", "unknown"),
    ],
  },
  dialog: {
    usage:
      "用于需要聚焦处理的编辑与确认流程，支持关闭拦截、固定操作区和移动端全屏。",
    code: `<KDialog
  v-model="open"
  title="编辑管理员"
  description="修改账号的基础资料与角色。"
>
  <!-- form -->
  <template #footer>...</template>
</KDialog>`,
    api: [
      item("v-model", "打开状态", "boolean", "false"),
      item("title / description", "标题和说明", "string"),
      item("size", "对话框尺寸", '"small" | "medium" | "large"', '"medium"'),
      item("beforeClose", "关闭前拦截", "KDialogBeforeClose"),
      item("mobileFullscreen", "移动端是否全屏", "boolean", "true"),
      item("footerFixed", "操作区是否固定", "boolean", "true"),
    ],
    events: [
      event("close", "请求关闭", "KDialogCloseReason"),
      event("opened / closed", "动画完成", "void"),
      event("submit", "关联表单提交", "SubmitEvent"),
    ],
  },
  "alert-dialog": {
    usage: "用于高风险确认，支持指定确认文字、操作原因和倒计时。",
    code: `<KAlertDialog
  v-model="open"
  title="确认停用账号？"
  description="停用后该管理员将立即退出所有会话。"
  tone="danger"
  show-reason
  @confirm="disableAccount"
/>`,
    api: [
      item("v-model", "打开状态", "boolean", "false"),
      item("title", "确认标题", "string"),
      item("tone", "风险等级", '"warning" | "danger"', '"warning"'),
      item("confirmationText", "要求输入的确认文字", "string"),
      item("showReason", "是否填写操作原因", "boolean", "false"),
      item("confirmCountdown", "确认倒计时秒数", "number", "0"),
    ],
    events: [
      event("confirm", "确认操作", "KAlertDialogConfirmPayload"),
      event("cancel", "取消操作", "reason"),
    ],
  },
  drawer: {
    usage:
      "用于在不离开当前页面的情况下查看或编辑详情，支持宽度调整和数据状态。",
    code: `<KDrawer
  v-model="open"
  title="账号详情"
  :width="480"
>
  <!-- detail content -->
</KDrawer>`,
    api: [
      item("v-model", "打开状态", "boolean", "false"),
      item("side", "出现方向", '"left" | "right"', '"right"'),
      item("width", "抽屉宽度", "string | number", "480"),
      item("resizable", "是否允许拖拽宽度", "boolean", "false"),
      item("loading / error", "内容状态", "boolean / string"),
      item("beforeClose", "关闭前拦截", "KDrawerBeforeClose"),
    ],
    events: [
      event("close", "请求关闭", "KDrawerCloseReason"),
      event("resize", "宽度改变", "number"),
      event("retry", "请求重新加载", "void"),
    ],
  },
  toast: {
    usage:
      "通过 Provider 和 useKToast 管理应用级通知，支持更新、Promise 状态和错误去重。",
    code: `<KToastProvider>
  <App />
</KToastProvider>

const toast = useKToast()
toast.success("配置已保存", {
  description: "新配置将在下次请求时生效。"
})`,
    api: [
      item("maxToasts", "最多同时显示数量", "number", "4"),
      item("defaultDuration", "默认停留毫秒", "number", "4500"),
      item(
        "position",
        "通知位置",
        '"top-right" | "bottom-right"',
        '"top-right"',
      ),
      item("toast.show", "显示自定义通知", "(input) => id"),
      item(
        "toast.success / warning / danger",
        "显示语义通知",
        "(title, options) => id",
      ),
      item("toast.promise", "绑定 Promise 状态", "(task, states) => Promise"),
    ],
  },
  "stat-card": {
    usage: "用于关键指标、趋势和同比变化，内置加载与错误状态。",
    code: `<KStatCard
  label="在线用户"
  :value="1286"
  unit="人"
  :change="12.4"
/>`,
    api: [
      item("label", "指标名称", "string"),
      item("value", "指标值", "string | number | null"),
      item("unit", "指标单位", "string"),
      item("change", "变化百分比", "number | null"),
      item("tone", "状态语义", "KStatCardTone", '"neutral"'),
      item("loading / error", "数据状态", "boolean / string"),
    ],
  },
  progress: {
    usage: "用于容量、评分和任务进度，可表达正常、成功、警告和危险语义。",
    code: `<KProgress
  :value="82"
  label="队列容量"
  tone="warning"
  show-value
/>`,
    api: [
      item("value", "当前数值", "number"),
      item("min / max", "范围边界", "number", "0 / 100"),
      item("label", "进度名称", "string"),
      item("tone", "状态语义", "KProgressTone", '"primary"'),
      item("showValue", "是否显示数值", "boolean", "true"),
      item("indeterminate", "是否为不定进度", "boolean", "false"),
    ],
  },
  steps: {
    usage: "用于审批、发布和风控处理流程，支持横向或纵向布局。",
    code: `<KSteps
  v-model="currentStep"
  :items="steps"
  clickable
/>`,
    api: [
      item("modelValue", "当前步骤值", "string | number | null"),
      item("items", "步骤列表", "KStepItem[]"),
      item(
        "orientation",
        "排列方向",
        '"horizontal" | "vertical"',
        '"horizontal"',
      ),
      item("clickable", "是否允许点击切换", "boolean", "false"),
      item("ariaLabel", "流程无障碍名称", "string", '"流程进度"'),
    ],
    events: [event("select", "选择步骤", "item, index")],
  },
  "refresh-control": {
    usage: "统一手动刷新、自动刷新周期、暂停状态和最后更新时间。",
    code: `<KRefreshControl
  v-model="refreshSeconds"
  v-model:paused="paused"
  :options="[15, 30, 60]"
  :last-updated="lastUpdated"
  @refresh="loadData"
/>`,
    api: [
      item("v-model", "自动刷新秒数", "number | null", "null"),
      item("v-model:paused", "是否暂停", "boolean", "false"),
      item("options", "可选刷新周期", "number[]", "[15, 30, 60]"),
      item("refreshing", "是否正在刷新", "boolean", "false"),
      item("lastUpdated", "最后更新时间", "Date | string | number"),
      item("disabled", "是否禁用", "boolean", "false"),
    ],
    events: [event("refresh", "请求刷新", '"manual" | "auto"')],
  },
  "log-viewer": {
    usage: "用于实时日志查看，支持等级过滤、搜索、复制、暂停和虚拟滚动。",
    code: `<KLogViewer
  v-model:query="query"
  v-model:paused="paused"
  :entries="logs"
  :height="320"
/>`,
    api: [
      item("entries", "日志记录", "KLogEntry[]"),
      item("height", "查看器高度", "number", "360"),
      item("query", "搜索词", "string", '""'),
      item("paused", "是否暂停自动滚动", "boolean", "false"),
      item("autoScroll", "是否自动滚动", "boolean", "true"),
      item("levels", "展示的日志等级", "KLogLevel[]"),
    ],
    events: [
      event("copy", "复制当前日志", "KLogEntry[]"),
      event("copyError", "复制失败", "unknown"),
    ],
  },
  "diff-viewer": {
    usage: "用于配置和文本变更对比，自动标记新增、删除和修改。",
    code: `<KDiffViewer
  :before="beforeConfig"
  :after="afterConfig"
  mode="json"
  :max-height="320"
/>`,
    api: [
      item("before", "变更前内容", "unknown"),
      item("after", "变更后内容", "unknown"),
      item("mode", "对比模式", '"auto" | "json" | "text"', '"auto"'),
      item("beforeLabel / afterLabel", "两侧标题", "string"),
      item("showUnchanged", "是否显示未变化行", "boolean", "true"),
      item("maxHeight", "最大高度", "string | number"),
    ],
  },
  "loading-state": {
    usage: "用于页面或数据区域加载中状态，骨架行数与目标内容布局保持接近。",
    code: `<KLoadingState
  title="正在加载管理员列表"
  description="正在同步最新数据，请稍候。"
  :rows="4"
/>`,
    api: [
      item("title", "加载标题", "string", '"正在加载"'),
      item("description", "加载说明", "string"),
      item("rows", "骨架行数", "number", "3"),
      item("minHeight", "状态区域最小高度", "string | number"),
    ],
  },
  "empty-state": {
    usage: "用于没有数据或尚未开始的场景，应明确说明下一步可执行操作。",
    code: `<KEmptyState
  title="暂无管理员"
  description="创建第一个管理员账号后，数据会显示在这里。"
  action-text="创建管理员"
  @action="openCreateDialog"
/>`,
    api: [
      item("title", "空状态标题", "string", '"暂无数据"'),
      item("description", "原因或下一步说明", "string"),
      item("actionText", "操作按钮文案", "string"),
      item("minHeight", "状态区域最小高度", "string | number"),
    ],
    events: [event("action", "点击主要操作", "void")],
  },
  "error-state": {
    usage: "用于区域加载失败，提供可访问的错误信息和可选重试操作。",
    code: `<KErrorState
  title="管理员列表加载失败"
  description="网络连接异常，请检查后重试。"
  retry-text="重新加载"
  @retry="loadData"
/>`,
    api: [
      item("title", "错误标题", "string", '"加载失败"'),
      item("description", "错误说明", "string"),
      item("retryText", "重试按钮文案", "string", '"重试"'),
      item("showRetry", "是否显示重试", "boolean", "true"),
      item("retryLoading", "是否正在重试", "boolean", "false"),
      item("minHeight", "状态区域最小高度", "string | number"),
    ],
    events: [event("retry", "点击重试", "void")],
  },
} as const satisfies Record<string, ComponentDoc>;

export type ComponentDocSlug = keyof typeof componentDocs;
