import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KInput from "./KInput.vue";

describe("KInput", () => {
  it("updates its model value from native input", async () => {
    const wrapper = mount(KInput, {
      props: {
        modelValue: ""
      }
    });

    await wrapper.get("input").setValue("operator");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["operator"]);
  });

  it("can reveal and hide a password", async () => {
    const wrapper = mount(KInput, {
      props: {
        type: "password",
        revealable: true,
        modelValue: "secret"
      }
    });

    const input = wrapper.get("input");
    expect(input.attributes("type")).toBe("password");

    await wrapper.get("button").trigger("click");
    expect(input.attributes("type")).toBe("text");
    expect(wrapper.get("button").attributes("aria-label")).toBe("隐藏密码");
  });
});
