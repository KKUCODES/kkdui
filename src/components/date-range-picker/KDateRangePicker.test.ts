import { mount } from "@vue/test-utils";
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";
import KDateRangePicker from "./KDateRangePicker.vue";

afterEach(() => {
  vi.useRealTimers();
});

describe("KDateRangePicker", () => {
  it("updates each side without losing the other boundary", async () => {
    const wrapper = mount(KDateRangePicker, {
      props: {
        modelValue: {
          start: "2026-07-01",
          end: "2026-07-28",
        },
      },
    });

    await wrapper.findAll("input")[0].setValue("2026-07-03");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      {
        start: "2026-07-03",
        end: "2026-07-28",
      },
    ]);
  });

  it("marks reversed ranges invalid and supports clearing", async () => {
    const wrapper = mount(KDateRangePicker, {
      props: {
        modelValue: {
          start: "2026-07-28",
          end: "2026-07-01",
        },
      },
    });

    expect(wrapper.classes()).toContain("k-date-range--invalid");
    expect(
      wrapper.findAll("input").every((input) => input.attributes("aria-invalid") === "true"),
    ).toBe(true);

    await wrapper.get('button[aria-label="清除日期范围"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });

  it("offers today, yesterday, recent 7-day, and recent 30-day shortcuts", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0));
    const wrapper = mount(KDateRangePicker);

    expect(wrapper.findAll(".k-date-range__shortcut")).toHaveLength(4);
    await wrapper.get('button[aria-label="选择近 7 天"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      {
        start: "2026-07-09",
        end: "2026-07-15",
      },
    ]);
    expect(wrapper.emitted("shortcut")?.at(-1)?.[0]).toMatchObject({
      key: "last-7-days",
    });
  });

  it("shows timezone, validates maximum span, and suggests a valid controlled granularity", async () => {
    const wrapper = mount(KDateRangePicker, {
      props: {
        modelValue: {
          start: "2026-07-01",
          end: "2026-07-02",
        },
        timeZone: "Asia/Shanghai",
        maxSpanDays: 7,
        granularity: "hour",
      },
    });

    expect(wrapper.get(".k-date-range__timezone").text()).toContain(
      "Asia/Shanghai",
    );
    await wrapper.findAll("input")[1].setValue("2026-07-20");

    expect(wrapper.classes()).toContain("k-date-range--invalid");
    expect(wrapper.get('[role="alert"]').text()).toContain("最多查询 7 天");
    expect(wrapper.emitted("update:granularity")?.at(-1)).toEqual(["day"]);

    await wrapper.get("select").setValue("week");
    expect(wrapper.emitted("update:granularity")?.at(-1)).toEqual(["week"]);
    expect(wrapper.emitted("granularityChange")?.at(-1)?.[0]).toMatchObject({
      value: "week",
      reason: "user",
    });
  });
});
