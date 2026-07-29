import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { SearchIcon } from "../../icons";
import KButton from "./KButton.vue";

describe("KButton", () => {
  it("emits click when it is interactive", async () => {
    const wrapper = mount(KButton, {
      slots: {
        default: "保存"
      }
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("blocks interaction and exposes busy state while loading", async () => {
    const wrapper = mount(KButton, {
      props: {
        loading: true
      },
      slots: {
        default: "保存中"
      }
    });

    const button = wrapper.get("button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.attributes("aria-busy")).toBe("true");

    await button.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("renders an icon component before its content", () => {
    const wrapper = mount(KButton, {
      props: {
        icon: SearchIcon
      },
      slots: {
        default: "搜索"
      }
    });

    expect(wrapper.findComponent(SearchIcon).exists()).toBe(true);
    expect(wrapper.get(".k-button__leading").text()).toBe("");
    expect(wrapper.text()).toContain("搜索");
  });
});
