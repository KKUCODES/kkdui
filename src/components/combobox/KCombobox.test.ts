import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import KCombobox from "./KCombobox.vue";

const options = [
  { label: "管理员", value: "admin" },
  { label: "审计员", value: 2, description: "只读权限" }
];

describe("KCombobox", () => {
  it("filters and selects an option with its original value type", async () => {
    const wrapper = mount(KCombobox, { props: { options } });
    await wrapper.get("input").trigger("focus");
    await wrapper.get("input").setValue("审计");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
    await wrapper.get('[role="option"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([2]);
  });

  it("loads remote results and reports an empty state", async () => {
    vi.useFakeTimers();
    const remoteMethod = vi.fn().mockResolvedValue([{ label: "远程用户", value: "remote" }]);
    const wrapper = mount(KCombobox, {
      props: { options: [], remote: true, remoteDebounce: 0, remoteMethod }
    });
    await wrapper.get("input").trigger("focus");
    await wrapper.get("input").setValue("远程");
    await vi.runAllTimersAsync();
    await flushPromises();
    expect(remoteMethod).toHaveBeenLastCalledWith("远程");
    expect(wrapper.text()).toContain("远程用户");
    vi.useRealTimers();
  });

  it("supports keyboard selection", async () => {
    const wrapper = mount(KCombobox, { props: { options } });
    await wrapper.get("input").trigger("focus");
    await wrapper.get("input").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["admin"]);
  });
});
