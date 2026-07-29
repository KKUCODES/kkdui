import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KCursorPagination from "./KCursorPagination.vue";

describe("KCursorPagination", () => {
  it("uses availability flags and emits navigation", async () => {
    const wrapper = mount(KCursorPagination, {
      props: {
        hasPrevious: false,
        hasNext: true,
        batchLabel: "第 21–40 条"
      }
    });
    const buttons = wrapper.findAll("button");

    expect(buttons[0].attributes("disabled")).toBeDefined();
    await buttons[1].trigger("click");
    expect(wrapper.emitted("next")).toHaveLength(1);
  });
});
