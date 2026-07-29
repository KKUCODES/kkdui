import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KDiffViewer from "./KDiffViewer.vue";

describe("KDiffViewer", () => {
  it("highlights added, removed and modified configuration values", () => {
    const wrapper = mount(KDiffViewer, {
      props: {
        before: { mode: "safe", oldKey: true, nested: { limit: 10 } },
        after: { mode: "fast", newKey: true, nested: { limit: 20 } }
      }
    });

    expect(wrapper.findAll(".is-added")).toHaveLength(1);
    expect(wrapper.findAll(".is-removed")).toHaveLength(1);
    expect(wrapper.findAll(".is-modified")).toHaveLength(2);
  });
});
