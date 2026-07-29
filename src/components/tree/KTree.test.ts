import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTree from "./KTree.vue";

const nodes = [
  {
    key: "users",
    label: "用户管理",
    children: [
      { key: "users.read", label: "查看用户" },
      { key: "users.write", label: "编辑用户" }
    ]
  },
  {
    key: "risk",
    label: "风险管理",
    children: [{ key: "risk.read", label: "查看风险" }]
  }
];

describe("KTree", () => {
  it("links parent and child checks and exposes mixed state", async () => {
    const wrapper = mount(KTree, {
      props: {
        nodes,
        expandedKeys: ["users"],
        "onUpdate:expandedKeys": (value) =>
          wrapper.setProps({ expandedKeys: value })
      }
    });

    const userCheckboxes = wrapper.findAll('input[type="checkbox"]');
    await userCheckboxes[1].setValue(true);
    expect(
      wrapper.find('[data-key="users"]').attributes("aria-checked")
    ).toBe("mixed");

    await userCheckboxes[2].setValue(true);
    const checked = wrapper.emitted("update:checkedKeys")?.at(-1)?.[0] as string[];
    expect(checked).toEqual(
      expect.arrayContaining(["users", "users.read", "users.write"])
    );
  });

  it("filters to matching branches and supports keyboard expansion", async () => {
    const wrapper = mount(KTree, { props: { nodes } });
    await wrapper.get('input[type="search"]').setValue("风险");
    expect(wrapper.find('[data-key="risk"]').exists()).toBe(true);
    expect(wrapper.find('[data-key="users"]').exists()).toBe(false);

    await wrapper.get('[data-key="risk"]').trigger("keydown", {
      key: "ArrowRight"
    });
    expect(wrapper.emitted("update:expandedKeys")?.at(-1)?.[0]).toEqual([
      "risk"
    ]);
  });
});
