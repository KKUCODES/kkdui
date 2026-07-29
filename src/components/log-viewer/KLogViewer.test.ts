import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import KLogViewer from "./KLogViewer.vue";

const entries = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  level: index % 2 === 0 ? ("info" as const) : ("error" as const),
  message: `message-${index}`,
  source: "api"
}));

describe("KLogViewer", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  it("virtualizes, filters and copies logs", async () => {
    const wrapper = mount(KLogViewer, {
      props: {
        entries,
        height: 100,
        rowHeight: 20,
        overscan: 1,
        query: "message-9"
      }
    });

    expect(wrapper.findAll(".k-log-viewer__row").length).toBeLessThan(20);
    expect(wrapper.text()).toContain("message-9");

    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(wrapper.emitted("copy")).toHaveLength(1);
  });
});
