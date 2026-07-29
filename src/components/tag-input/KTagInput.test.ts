import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTagInput from "./KTagInput.vue";
import type { KTagRejection } from "./types";

describe("KTagInput", () => {
  it("adds tags with Enter and removes with Backspace", async () => {
    const wrapper = mount(KTagInput, { props: { modelValue: ["10.0.0.1"] } });
    const input = wrapper.get("input");
    await input.setValue("10.0.0.2");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["10.0.0.1", "10.0.0.2"]]);
  });

  it("validates duplicate and format errors", async () => {
    const wrapper = mount(KTagInput, {
      props: {
        modelValue: ["risk"],
        pattern: /^[a-z]+$/
      }
    });
    await wrapper.get("input").setValue("risk");
    await wrapper.get("input").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted<[KTagRejection[]]>("reject")?.at(-1)?.[0]?.[0]).toMatchObject({ reason: "duplicate" });
    expect(wrapper.get('[role="alert"]').text()).toBe("标签已存在");
  });

  it("supports bulk paste and rejects invalid entries", async () => {
    const wrapper = mount(KTagInput, {
      props: { modelValue: [], pattern: /^\d+\.\d+\.\d+\.\d+$/ }
    });
    await wrapper.get("input").trigger("paste", {
      clipboardData: { getData: () => "10.0.0.1,invalid\n10.0.0.2" }
    });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["10.0.0.1", "10.0.0.2"]]);
    expect(wrapper.emitted<[KTagRejection[]]>("reject")?.at(-1)?.[0]?.[0]).toMatchObject({ value: "invalid", reason: "format" });
  });
});
