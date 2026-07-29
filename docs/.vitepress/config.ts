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
          text: "基础组件",
          items: [
            { text: "Button 按钮", link: "/components/button" },
            { text: "Input 输入框", link: "/components/input" },
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
