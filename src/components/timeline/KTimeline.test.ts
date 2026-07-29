import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTimeline from "./KTimeline.vue";

describe("KTimeline", () => {
  it("renders chronological events with semantic time values", () => {
    const wrapper = mount(KTimeline, {
      props: {
        items: [
          {
            key: 1,
            title: "游客登录",
            timestamp: "10:24",
            datetime: "2026-03-12T10:24:00+08:00",
            description: "IP 10.0.0.1"
          },
          { key: 2, title: "进入牌局", timestamp: "10:28" }
        ]
      }
    });

    expect(wrapper.findAll("li")).toHaveLength(2);
    expect(wrapper.get("time").attributes("datetime")).toBe(
      "2026-03-12T10:24:00+08:00"
    );
    expect(wrapper.text()).toContain("进入牌局");
  });
});
