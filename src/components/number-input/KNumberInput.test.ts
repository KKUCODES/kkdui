import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KNumberInput from "./KNumberInput.vue";

describe("KNumberInput", () => {
  it("steps and clamps a value", async () => {
    const wrapper = mount(KNumberInput, {
      props: { modelValue: 9, min: 0, max: 10, step: 2 }
    });
    await wrapper.get('button[aria-label="增加"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([10]);
  });

  it("rejects invalid and oversized values", async () => {
    const wrapper = mount(KNumberInput, {
      props: { modelValue: 5, maxSafeValue: 100 }
    });
    await wrapper.get("input").setValue("999");
    expect(wrapper.emitted("invalidInput")?.at(-1)).toEqual(["999"]);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("respects decimal precision", async () => {
    const wrapper = mount(KNumberInput, {
      props: { modelValue: null, precision: 2 }
    });
    await wrapper.get("input").setValue("1.25");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([1.25]);
  });
});
