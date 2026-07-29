import {
  flushPromises,
  mount
} from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KPopover from "./KPopover.vue";

describe("KPopover", () => {
  it("opens from keyboard, focuses its action and closes with Escape", async () => {
    const wrapper = mount(KPopover, {
      attachTo: document.body,
      props: {
        title: "快捷操作",
        initialFocus: true
      },
      slots: {
        trigger: "更多",
        default: '<button id="quick-action">复制 ID</button>'
      },
      global: { stubs: { Teleport: true } }
    });
    const trigger = wrapper.get<HTMLElement>(".k-popover__trigger");

    await trigger.trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(document.activeElement?.id).toBe("quick-action");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("closes when pointer interaction happens outside", async () => {
    const wrapper = mount(KPopover, {
      attachTo: document.body,
      slots: { trigger: "更多", default: "内容" },
      global: { stubs: { Teleport: true } }
    });

    await wrapper.get(".k-popover__trigger").trigger("click");
    await flushPromises();
    document.body.dispatchEvent(
      new Event("pointerdown", { bubbles: true })
    );
    await flushPromises();

    expect(wrapper.emitted("close")?.at(-1)).toEqual(["outside"]);
    wrapper.unmount();
  });
});
