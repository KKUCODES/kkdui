import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KSteps from "./KSteps.vue";

const items = [
  { value: "request", title: "提交申请" },
  { value: "review", title: "审批" },
  { value: "done", title: "完成", disabled: true }
] as const;

describe("KSteps", () => {
  it("derives statuses and emits controlled selection", async () => {
    const wrapper = mount(KSteps, {
      props: {
        items,
        modelValue: "review",
        clickable: true
      }
    });

    expect(wrapper.findAll(".is-complete")).toHaveLength(1);
    expect(wrapper.get('[aria-current="step"]').text()).toContain("审批");

    await wrapper.findAll("button")[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["request"]);
    expect(wrapper.findAll("button")[2].attributes("disabled")).toBeDefined();
  });
});
