import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KSelect from "./KSelect.vue";

const options = [
  { label: "全部状态", value: "all" },
  { label: "在线", value: 1 },
  { label: "锁定", value: 2, disabled: true },
];

describe("KSelect", () => {
  it("preserves option value types when selection changes", async () => {
    const wrapper = mount(KSelect, {
      props: {
        options,
        modelValue: "all",
      },
    });

    await wrapper.get("select").setValue("1");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([1]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toBe(1);
  });

  it("clears a controlled value and restores focus", async () => {
    const wrapper = mount(KSelect, {
      attachTo: document.body,
      props: {
        options,
        modelValue: "all",
        clearable: true,
      },
    });

    await wrapper.get('button[aria-label="清除选择"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
    expect(wrapper.emitted("clear")).toHaveLength(1);
    expect(document.activeElement).toBe(wrapper.get("select").element);

    wrapper.unmount();
  });
});
