import {
  flushPromises,
  mount
} from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import KDrawer from "./KDrawer.vue";

describe("KDrawer", () => {
  it("applies side and width while preserving modal semantics", async () => {
    const wrapper = mount(KDrawer, {
      props: {
        modelValue: true,
        title: "游客详情",
        side: "left",
        width: 520,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.get(".k-drawer").classes()).toContain("k-drawer--left");
    expect(wrapper.get('[role="dialog"]').attributes("style")).toContain(
      "width: 520px",
    );
    expect(wrapper.get('[role="dialog"]').attributes("aria-modal")).toBe(
      "true",
    );

    await wrapper.get('button[aria-label="关闭抽屉"]').trigger("click");
    expect(wrapper.emitted("close")?.at(-1)).toEqual(["close-button"]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([false]);

    wrapper.unmount();
  });

  it("waits for beforeClose and keeps unsaved content open when denied", async () => {
    const beforeClose = vi.fn().mockResolvedValue(false);
    const wrapper = mount(KDrawer, {
      props: {
        modelValue: true,
        title: "风险详情",
        beforeClose,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    await wrapper.get('button[aria-label="关闭抽屉"]').trigger("click");
    await flushPromises();
    expect(beforeClose).toHaveBeenCalledWith("close-button");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    beforeClose.mockResolvedValueOnce(true);
    await wrapper.get('button[aria-label="关闭抽屉"]').trigger("click");
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([false]);
  });

  it("provides resizable, full-screen, loading, and retryable error states", async () => {
    const wrapper = mount(KDrawer, {
      props: {
        modelValue: true,
        title: "房间详情",
        width: 480,
        resizable: true,
        minWidth: 360,
        maxWidth: 640,
        mobileFullscreen: true,
        loading: true,
      },
      slots: {
        footer: "<button>保存</button>",
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.get(".k-drawer").classes()).toContain(
      "k-drawer--mobile-fullscreen",
    );
    expect(wrapper.get(".k-drawer").classes()).toContain(
      "k-drawer--fixed-footer",
    );
    expect(wrapper.get(".k-drawer__body").attributes("aria-busy")).toBe("true");

    const separator = wrapper.get('[role="separator"]');
    expect(separator.attributes("aria-valuenow")).toBe("480");
    await separator.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("resize")?.at(-1)).toEqual([488]);

    await wrapper.setProps({ loading: false, error: "详情加载失败" });
    expect(wrapper.get('[role="alert"]').text()).toContain("详情加载失败");
    await wrapper.get("button.k-drawer__retry").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
