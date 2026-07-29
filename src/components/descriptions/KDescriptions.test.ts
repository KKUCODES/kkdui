import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KDescriptions from "./KDescriptions.vue";

describe("KDescriptions", () => {
  it("renders semantic key values and named status content", () => {
    const wrapper = mount(KDescriptions, {
      props: {
        items: [
          { key: "guest", label: "游客 ID", value: "guest_65" },
          {
            key: "status",
            label: "账号状态",
            value: "active",
            status: "active"
          }
        ]
      },
      slots: {
        "status-status": ({ status }) => `状态：${status}`
      }
    });

    expect(wrapper.findAll("dt")).toHaveLength(2);
    expect(wrapper.findAll("dd")[0].text()).toBe("guest_65");
    expect(wrapper.findAll("dd")[1].text()).toBe("状态：active");
  });
});
