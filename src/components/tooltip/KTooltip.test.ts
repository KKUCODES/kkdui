import {
  flushPromises,
  mount
} from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTooltip from "./KTooltip.vue";

describe("KTooltip", () => {
  it("links tooltip content to its focused trigger and closes on Escape", async () => {
    const wrapper = mount(KTooltip, {
      attachTo: document.body,
      props: {
        content: "完整 IP 地址",
        openDelay: 0
      },
      slots: { default: "10.0…" },
      global: { stubs: { Teleport: true } }
    });
    const trigger = wrapper.get(".k-tooltip__trigger");

    await trigger.trigger("focusin");
    await flushPromises();
    const tooltip = wrapper.get('[role="tooltip"]');
    expect(trigger.attributes("aria-describedby")).toBe(
      tooltip.attributes("id")
    );

    await trigger.trigger("keydown", { key: "Escape" });
    await flushPromises();
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
