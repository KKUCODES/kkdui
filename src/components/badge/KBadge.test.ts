import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KBadge from "./KBadge.vue";

describe("KBadge", () => {
  it("renders semantic live status only when requested", () => {
    const wrapper = mount(KBadge, {
      props: {
        tone: "success",
        live: true,
      },
      slots: {
        default: "在线",
      },
    });

    expect(wrapper.classes()).toContain("k-badge--success");
    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-live")).toBe("polite");
    expect(wrapper.text()).toBe("在线");
  });

  it("maps realtime states and supports long wrapped labels", () => {
    const wrapper = mount(KBadge, {
      props: {
        status: "connecting",
        wrap: true,
        maxWidth: 160
      },
      slots: {
        default: "正在重新连接实时牌局服务"
      }
    });

    expect(wrapper.classes()).toContain("k-badge--info");
    expect(wrapper.classes()).toContain("k-badge--status-connecting");
    expect(wrapper.classes()).toContain("k-badge--wrap");
    expect(wrapper.attributes("role")).toBe("status");
  });
});
