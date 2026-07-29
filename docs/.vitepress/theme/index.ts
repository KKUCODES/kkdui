import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { KButton, KInput } from "../../../src";
import ComponentReference from "./components/ComponentReference.vue";
import DemoBlock from "./components/DemoBlock.vue";
import "./styles.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ComponentReference", ComponentReference);
    app.component("DemoBlock", DemoBlock);
    app.component("KButton", KButton);
    app.component("KInput", KInput);
  },
} satisfies Theme;
