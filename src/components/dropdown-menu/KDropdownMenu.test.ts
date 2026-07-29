import {
  flushPromises,
  mount
} from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KDropdownMenu from "./KDropdownMenu.vue";

const items = [
  { key: "detail", label: "查看详情" },
  { key: "reset", label: "重置密码" },
  {
    key: "disable",
    label: "停用账号",
    danger: true,
    separatorBefore: true,
  },
];

describe("KDropdownMenu", () => {
  it("opens from its anchored trigger and emits item selection", async () => {
    const wrapper = mount(KDropdownMenu, {
      attachTo: document.body,
      props: {
        items,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });

    await wrapper.get('button[aria-haspopup="menu"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);

    await wrapper.findAll('[role="menuitem"]')[1].trigger("click");
    expect(wrapper.emitted("select")?.at(-1)?.[0]).toEqual(items[1]);
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);

    wrapper.unmount();
  });

  it("supports Arrow keys and Escape with focus restoration", async () => {
    const wrapper = mount(KDropdownMenu, {
      attachTo: document.body,
      props: {
        items,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    const trigger = wrapper.get<HTMLButtonElement>(
      'button[aria-haspopup="menu"]',
    );

    await trigger.trigger("keydown", { key: "ArrowUp" });
    await flushPromises();
    const menuItems = wrapper.findAll<HTMLButtonElement>('[role="menuitem"]');
    expect(document.activeElement).toBe(menuItems.at(-1)!.element);

    await menuItems.at(-1)!.trigger("keydown", { key: "Escape" });
    await flushPromises();
    expect(document.activeElement).toBe(trigger.element);

    wrapper.unmount();
  });

  it("shows descriptions and bridges confirmed operations", async () => {
    const confirmedItem = {
      key: "terminate",
      label: "结束会话",
      description: "强制当前设备下线",
      icon: "!",
      requiresConfirmation: true
    };
    const wrapper = mount(KDropdownMenu, {
      props: { items: [confirmedItem] },
      global: { stubs: { Teleport: true } }
    });

    await wrapper.get('button[aria-haspopup="menu"]').trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("强制当前设备下线");
    await wrapper.get('[role="menuitem"]').trigger("click");
    expect(wrapper.emitted("confirm")?.at(-1)).toEqual([confirmedItem]);
  });
});
