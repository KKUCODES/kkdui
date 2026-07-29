import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KSwitch from "./KSwitch.vue";

describe("KSwitch", () => {
  it("uses native switch semantics and updates its model", async () => {
    const wrapper = mount(KSwitch, {
      props: {
        modelValue: false,
        label: "启用账号",
      },
    });
    const input = wrapper.get('[role="switch"]');

    await input.setValue(true);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([true]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toBe(true);
  });

  it("locks interaction while an update is pending", () => {
    const wrapper = mount(KSwitch, {
      props: {
        modelValue: true,
        loading: true,
        label: "启用账号",
      },
    });
    const input = wrapper.get('[role="switch"]');

    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-busy")).toBe("true");
  });
});
