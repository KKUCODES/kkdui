import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KStatCard from "./KStatCard.vue";

describe("KStatCard", () => {
  it("renders values, trends, loading and error states", async () => {
    const wrapper = mount(KStatCard, {
      props: {
        label: "在线游客",
        value: 128,
        unit: "人",
        change: 8.2,
        changeLabel: "较昨日"
      }
    });

    expect(wrapper.text()).toContain("128");
    expect(wrapper.text()).toContain("+8.2%");

    await wrapper.setProps({ loading: true });
    expect(wrapper.attributes("aria-busy")).toBe("true");

    await wrapper.setProps({ loading: false, error: "指标加载失败" });
    expect(wrapper.get('[role="alert"]').text()).toContain("指标加载失败");
  });
});
