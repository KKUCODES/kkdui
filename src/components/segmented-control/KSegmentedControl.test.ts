import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KSegmentedControl from "./KSegmentedControl.vue";

const options = [
  { label: "全部", value: "all" },
  { label: "在线", value: 1 },
  { label: "锁定", value: 2, disabled: true }
];

describe("KSegmentedControl", () => {
  it("selects values while preserving their types", async () => {
    const wrapper = mount(KSegmentedControl, { props: { options, modelValue: "all" } });
    await wrapper.findAll("button")[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([1]);
  });

  it("supports arrow keyboard navigation and skips disabled options", async () => {
    const wrapper = mount(KSegmentedControl, { props: { options, modelValue: 1 } });
    await wrapper.findAll("button")[1]!.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["all"]);
  });
});
