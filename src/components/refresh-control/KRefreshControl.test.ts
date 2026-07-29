import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import KRefreshControl from "./KRefreshControl.vue";

describe("KRefreshControl", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("supports manual, automatic and paused refresh", async () => {
    vi.useFakeTimers();
    const wrapper = mount(KRefreshControl, {
      props: {
        modelValue: 5,
        paused: false
      }
    });

    vi.advanceTimersByTime(5000);
    expect(wrapper.emitted("refresh")?.at(-1)).toEqual(["auto"]);

    await wrapper.findAll("button")[0].trigger("click");
    expect(wrapper.emitted("refresh")?.at(-1)).toEqual(["manual"]);

    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.emitted("update:paused")?.at(-1)).toEqual([true]);
  });

  it("keeps the last update time visible while refreshing", () => {
    const wrapper = mount(KRefreshControl, {
      props: {
        refreshing: true,
        lastUpdated: new Date("2026-07-29T02:03:04Z")
      }
    });

    const updated = wrapper.find(".k-refresh-control__updated");
    expect(updated.text()).toContain("最后更新");
    expect(updated.text()).not.toContain("刷新中");
  });
});
