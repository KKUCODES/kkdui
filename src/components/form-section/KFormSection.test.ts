import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KFormSection from "./KFormSection.vue";

describe("KFormSection", () => {
  it("keeps its region linked and toggles collapsed state", async () => {
    const wrapper = mount(KFormSection, {
      props: {
        title: "风控规则",
        description: "命中后执行的动作",
        collapsible: true
      },
      slots: { default: "规则内容" }
    });
    const toggle = wrapper.get("button");
    const panel = wrapper.get('[role="region"]');

    expect(toggle.attributes("aria-controls")).toBe(panel.attributes("id"));
    await toggle.trigger("click");
    expect(wrapper.emitted("update:collapsed")?.at(-1)).toEqual([true]);
    expect(panel.isVisible()).toBe(false);
  });
});
