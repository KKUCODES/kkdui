import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTextarea from "./KTextarea.vue";

describe("KTextarea", () => {
  it("updates the controlled value and count", async () => {
    const wrapper = mount(KTextarea, {
      props: { modelValue: "", maxlength: 10, showCount: true }
    });
    await wrapper.get("textarea").setValue("操作原因");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["操作原因"]);
    expect(wrapper.get(".k-textarea__count").text()).toBe("4/10");
  });

  it("forwards disabled and invalid semantics", () => {
    const wrapper = mount(KTextarea, {
      props: { disabled: true, invalid: true }
    });
    expect(wrapper.get("textarea").attributes("disabled")).toBeDefined();
    expect(wrapper.get("textarea").attributes("aria-invalid")).toBe("true");
  });
});
