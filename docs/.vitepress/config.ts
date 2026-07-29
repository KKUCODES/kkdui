import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "zh-CN",
  title: "KKDUI",
  description: "面向 Vue 3 后台管理系统的通用组件库",
  base: "/kkdui/",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#257360" }],
    ["link", { rel: "icon", href: "/kkdui/logo.svg", type: "image/svg+xml" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "KKDUI",
    nav: [
      { text: "指南", link: "/guide/getting-started" },
      { text: "组件", link: "/components/" },
      {
        text: "资源",
        items: [
          {
            text: "npm",
            link: "https://www.npmjs.com/package/kkdui",
          },
          {
            text: "更新记录",
            link: "https://github.com/KKUCODES/kkdui/releases",
          },
        ],
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "设计原则", link: "/guide/design-principles" },
          ],
        },
      ],
      "/components/": [
        {
          text: "组件总览",
          items: [{ text: "全部组件", link: "/components/" }],
        },
        {
          text: "表单与筛选",
          items: [
            { text: "Button 按钮", link: "/components/button" },
            { text: "Input 输入框", link: "/components/input" },
            { text: "Textarea 文本域", link: "/components/textarea" },
            {
              text: "NumberInput 数字输入",
              link: "/components/number-input",
            },
            { text: "RadioGroup 单选组", link: "/components/radio-group" },
            {
              text: "SegmentedControl 分段",
              link: "/components/segmented-control",
            },
            { text: "Select 选择器", link: "/components/select" },
            { text: "Combobox 组合框", link: "/components/combobox" },
            { text: "MultiSelect 多选器", link: "/components/multi-select" },
            { text: "TagInput 标签输入", link: "/components/tag-input" },
            {
              text: "DateRangePicker 日期范围",
              link: "/components/date-range-picker",
            },
            { text: "Checkbox 复选框", link: "/components/checkbox" },
            { text: "Switch 开关", link: "/components/switch" },
            { text: "FormItem 表单项", link: "/components/form-item" },
            { text: "FormSection 表单分区", link: "/components/form-section" },
          ],
        },
        {
          text: "数据与导航",
          items: [
            { text: "Table 表格", link: "/components/table" },
            { text: "Pagination 分页", link: "/components/pagination" },
            {
              text: "CursorPagination 游标分页",
              link: "/components/cursor-pagination",
            },
            { text: "Tabs 标签页", link: "/components/tabs" },
            { text: "Badge 徽标", link: "/components/badge" },
            {
              text: "DropdownMenu 下拉菜单",
              link: "/components/dropdown-menu",
            },
          ],
        },
        {
          text: "详情与结构",
          items: [
            { text: "Tree 树", link: "/components/tree" },
            {
              text: "Descriptions 描述列表",
              link: "/components/descriptions",
            },
            { text: "Timeline 时间线", link: "/components/timeline" },
            { text: "Tooltip 文字提示", link: "/components/tooltip" },
            { text: "Popover 气泡卡片", link: "/components/popover" },
            { text: "CopyButton 复制按钮", link: "/components/copy-button" },
          ],
        },
        {
          text: "弹层与反馈",
          items: [
            { text: "Dialog 对话框", link: "/components/dialog" },
            {
              text: "AlertDialog 风险确认",
              link: "/components/alert-dialog",
            },
            { text: "Drawer 抽屉", link: "/components/drawer" },
            { text: "Toast 通知", link: "/components/toast" },
          ],
        },
        {
          text: "状态与运维",
          items: [
            { text: "StatCard 指标卡", link: "/components/stat-card" },
            { text: "Progress 进度", link: "/components/progress" },
            { text: "Steps 步骤", link: "/components/steps" },
            {
              text: "RefreshControl 刷新控制",
              link: "/components/refresh-control",
            },
            { text: "LogViewer 日志查看", link: "/components/log-viewer" },
            { text: "DiffViewer 差异查看", link: "/components/diff-viewer" },
            {
              text: "LoadingState 加载状态",
              link: "/components/loading-state",
            },
            {
              text: "EmptyState 空状态",
              link: "/components/empty-state",
            },
            {
              text: "ErrorState 错误状态",
              link: "/components/error-state",
            },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/KKUCODES/kkdui" },
    ],
    search: {
      provider: "local",
    },
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    editLink: {
      pattern: "https://github.com/KKUCODES/kkdui/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },
    footer: {
      message: "基于 MIT 许可发布",
      copyright: "Copyright © 2026 KKDUI",
    },
  },
});
