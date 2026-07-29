import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KRadioGroup from "./KRadioGroup.vue";

const options = [
  { label: "自动", value: "auto", description: "由系统判断" },
  { label: "手动", value: 2 },
  { label: "停用", value: "disabled", disabled: true }
];

describe("KRadioGroup", () => {
  it("preserves option value types", async () => {
    const wrapper = mount(KRadioGroup, { props: { options, modelValue: "auto" } });
    await wrapper.findAll('input[type="radio"]')[1]!.setValue(true);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([2]);
  });

  it("renders descriptions and disabled options", () => {
    const wrapper = mount(KRadioGroup, { props: { options } });
    expect(wrapper.text()).toContain("由系统判断");
    expect(wrapper.findAll("input")[2]!.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("role")).toBe("radiogroup");
  });
});
