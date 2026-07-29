import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KProgress from "./KProgress.vue";

describe("KProgress", () => {
  it("clamps values and exposes progress semantics", () => {
    const wrapper = mount(KProgress, {
      props: {
        label: "风险评分",
        value: 140,
        max: 100
      }
    });

    const progress = wrapper.get('[role="progressbar"]');
    expect(progress.attributes("aria-valuenow")).toBe("100");
    expect(progress.attributes("aria-valuetext")).toBe("100%");
  });
});
