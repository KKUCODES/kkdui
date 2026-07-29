import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { KButton, KInput } from "../../../src";
import DemoBlock from "./components/DemoBlock.vue";
import "./styles.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DemoBlock", DemoBlock);
    app.component("KButton", KButton);
    app.component("KInput", KInput);
  },
} satisfies Theme;
