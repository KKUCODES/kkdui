import {
  mount,
  flushPromises
} from "@vue/test-utils";
import {
  describe,
  expect,
  it,
  vi
} from "vitest";
import KCopyButton from "./KCopyButton.vue";

describe("KCopyButton", () => {
  it("copies through Clipboard API and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    const wrapper = mount(KCopyButton, {
      props: { value: "guest_0065" }
    });

    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith("guest_0065");
    expect(wrapper.emitted("success")?.[0]).toEqual(["guest_0065"]);
    expect(wrapper.get('[role="status"]').text()).toBe("已复制");
  });

  it("emits errors without reporting false success", async () => {
    const error = new Error("denied");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(error) }
    });
    const wrapper = mount(KCopyButton, { props: { value: "10.0.0.1" } });

    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("error")?.[0]).toEqual([error]);
    expect(wrapper.classes()).toContain("is-error");
  });
});
