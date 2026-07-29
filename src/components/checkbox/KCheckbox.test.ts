import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import KCheckbox from "./KCheckbox.vue";

describe("KCheckbox", () => {
  it("emits its boolean model and change event", async () => {
    const wrapper = mount(KCheckbox, {
      props: {
        modelValue: false,
        label: "查看金币流水",
      },
    });

    await wrapper.get("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([true]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toBe(true);
  });

  it("sets the native indeterminate and invalid states", async () => {
    const wrapper = mount(KCheckbox, {
      props: {
        indeterminate: true,
        invalid: true,
        label: "全部权限",
      },
    });
    await nextTick();
    const input = wrapper.get("input");

    expect((input.element as HTMLInputElement).indeterminate).toBe(true);
    expect(input.attributes("aria-invalid")).toBe("true");
  });
});
