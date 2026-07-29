import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import KFormItem from "./KFormItem.vue";

describe("KFormItem", () => {
  it("associates its label and error with the control", () => {
    const wrapper = mount(KFormItem, {
      props: {
        label: "账号",
        controlId: "account",
        error: "请输入账号"
      },
      slots: {
        default: ({ controlId, describedBy }) =>
          h("input", {
            id: controlId,
            "aria-describedby": describedBy
          })
      }
    });

    expect(wrapper.get("label").attributes("for")).toBe("account");
    expect(wrapper.get("input").attributes("aria-describedby")).toBe(
      "account-error"
    );
    expect(wrapper.get('[role="alert"]').text()).toBe("请输入账号");
  });

  it("renders multiple errors and length guidance", () => {
    const wrapper = mount(KFormItem, {
      props: {
        label: "操作原因",
        controlId: "reason",
        errors: ["必须填写", "至少 10 个字"],
        currentLength: 4,
        maxLength: 200,
        labelDescription: "将写入审计日志"
      },
      slots: {
        default: ({ controlId, describedBy }) =>
          h("textarea", {
            id: controlId,
            "aria-describedby": describedBy
          })
      }
    });

    expect(wrapper.findAll(".k-form-item__errors li")).toHaveLength(2);
    expect(wrapper.text()).toContain("4 / 200");
    expect(wrapper.attributes("data-form-item-invalid")).toBe("true");
  });
});
