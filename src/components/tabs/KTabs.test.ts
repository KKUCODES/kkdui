import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTabs from "./KTabs.vue";

const items = [
  { value: "profile", label: "资料" },
  { value: "sessions", label: "会话" },
  { value: "games", label: "牌局", disabled: true },
  { value: "coins", label: "金币流水", badge: 8 },
];

describe("KTabs", () => {
  it("renders associated tab panels and emits controlled changes", async () => {
    const wrapper = mount(KTabs, {
      props: {
        items,
        modelValue: "profile",
      },
      slots: {
        "panel-profile": "资料内容",
        "panel-sessions": "会话内容",
      },
    });

    expect(wrapper.get('[role="tabpanel"]:not([style*="display: none"])').text()).toBe(
      "资料内容",
    );
    await wrapper.findAll('[role="tab"]')[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      "sessions",
    ]);
    expect(wrapper.emitted("change")?.at(-1)).toEqual(["sessions"]);

    await wrapper.setProps({ modelValue: "games" });
    expect(wrapper.get('[aria-selected="true"]').text()).toBe("资料");
  });

  it("moves across enabled tabs with wraparound keyboard navigation", async () => {
    const wrapper = mount(KTabs, {
      attachTo: document.body,
      props: {
        items,
        modelValue: "profile",
      },
    });
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]');

    await tabs[0].trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[3].element);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["coins"]);

    wrapper.unmount();
  });

  it("renders async panel errors and emits retry", async () => {
    const asyncItems = [
      {
        value: "risk",
        label: "风险",
        badge: 3,
        badgeTone: "danger" as const,
        error: "风险记录加载失败"
      }
    ];
    const wrapper = mount(KTabs, {
      props: {
        items: asyncItems,
        modelValue: "risk",
        mobileMode: "select"
      }
    });

    expect(wrapper.get('[role="alert"]').text()).toContain("风险记录加载失败");
    await wrapper.get('[role="alert"] button').trigger("click");
    expect(wrapper.emitted("retry")?.at(-1)).toEqual([asyncItems[0]]);
    expect(wrapper.find(".k-tabs__mobile-select").exists()).toBe(true);
  });
});
