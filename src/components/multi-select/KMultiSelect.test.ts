import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KMultiSelect from "./KMultiSelect.vue";

const options = [
  { label: "管理员", value: "admin" },
  { label: "审计员", value: 2 },
  { label: "访客", value: "guest" }
];

describe("KMultiSelect", () => {
  it("adds and removes values while preserving types", async () => {
    const wrapper = mount(KMultiSelect, { props: { options, modelValue: ["admin"] } });
    await wrapper.get("input").trigger("focus");
    await wrapper.findAll('[role="option"]')[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["admin", 2]]);
  });

  it("filters options and clears all selections", async () => {
    const wrapper = mount(KMultiSelect, {
      props: { options, modelValue: ["admin", 2], clearable: true }
    });
    await wrapper.get("input").setValue("访客");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
    await wrapper.get('button[aria-label="清除全部选择"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });

  it("collapses overflowing selected tags", () => {
    const wrapper = mount(KMultiSelect, {
      props: { options, modelValue: ["admin", 2, "guest"], maxTagCount: 1 }
    });
    expect(wrapper.find(".k-multi-select__tag--count").text()).toBe("+2");
  });
});
