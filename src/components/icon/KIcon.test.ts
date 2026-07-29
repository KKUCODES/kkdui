import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KIcon from "./KIcon.vue";

describe("KIcon", () => {
  it("exposes a labelled icon with configurable size and color", () => {
    const wrapper = mount(KIcon, {
      props: {
        label: "搜索",
        size: 20,
        color: "#257360",
      },
      slots: {
        default: "<svg data-test-icon></svg>",
      },
    });

    expect(wrapper.attributes("role")).toBe("img");
    expect(wrapper.attributes("aria-label")).toBe("搜索");
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
    expect(wrapper.attributes("style")).toContain("--k-icon-size: 20px");
    expect(wrapper.attributes("style")).toContain("--k-icon-color: #257360");
    expect(wrapper.find("[data-test-icon]").exists()).toBe(true);
  });
});
