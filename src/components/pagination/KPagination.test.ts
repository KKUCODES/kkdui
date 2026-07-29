import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KPagination from "./KPagination.vue";

describe("KPagination", () => {
  it("renders the current range and folds distant pages", () => {
    const wrapper = mount(KPagination, {
      props: {
        page: 10,
        pageSize: 10,
        total: 198,
      },
    });

    expect(wrapper.text()).toContain("第 91–100 条，共 198 条");
    expect(wrapper.get('[aria-current="page"]').text()).toBe("10");
    expect(wrapper.get('[role="status"]').text()).toContain(
      "当前第 10 页，共 20 页",
    );
    expect(wrapper.findAll(".k-pagination__ellipsis")).toHaveLength(2);
    expect(wrapper.get('button[aria-label="第 1 页"]')).toBeTruthy();
    expect(wrapper.get('button[aria-label="第 20 页"]')).toBeTruthy();
  });

  it("supports a compact desktop density", () => {
    const wrapper = mount(KPagination, {
      props: {
        page: 1,
        pageSize: 10,
        total: 30,
        size: "small",
      },
    });

    expect(wrapper.get("nav").classes()).toContain("k-pagination--small");
  });

  it("emits controlled page changes without mutating its own page", async () => {
    const wrapper = mount(KPagination, {
      props: {
        page: 3,
        pageSize: 10,
        total: 86,
      },
    });

    await wrapper.get('button[aria-label="上一页"]').trigger("click");
    expect(wrapper.emitted("update:page")?.at(-1)).toEqual([2]);

    await wrapper.get('button[aria-label="下一页"]').trigger("click");
    expect(wrapper.emitted("update:page")?.at(-1)).toEqual([4]);

    await wrapper.get('button[aria-label="第 1 页"]').trigger("click");
    expect(wrapper.emitted("update:page")?.at(-1)).toEqual([1]);
    expect(wrapper.get('[aria-current="page"]').text()).toBe("3");

    await wrapper.setProps({ page: 4 });
    expect(wrapper.get('[role="status"]').text()).toContain(
      "当前第 4 页，共 9 页",
    );
  });

  it("disables navigation at page boundaries", async () => {
    const wrapper = mount(KPagination, {
      props: {
        page: 1,
        pageSize: 10,
        total: 31,
      },
    });

    expect(
      wrapper.get('button[aria-label="上一页"]').attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.get('button[aria-label="下一页"]').attributes("disabled"),
    ).toBeUndefined();

    await wrapper.setProps({ page: 4 });
    expect(
      wrapper.get('button[aria-label="下一页"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("normalizes page-size options and resets the page after a size change", async () => {
    const wrapper = mount(KPagination, {
      props: {
        page: 4,
        pageSize: 25,
        total: 286,
        pageSizeOptions: [50, 20, 20, -10],
      },
    });
    const options = wrapper.findAll("option");

    expect(options.map((option) => option.attributes("value"))).toEqual([
      "20",
      "25",
      "50",
    ]);

    await wrapper.get("select").setValue("50");
    expect(wrapper.emitted("update:pageSize")?.at(-1)).toEqual([50]);
    expect(wrapper.emitted("update:page")?.at(-1)).toEqual([1]);
  });

  it("supports disabled, empty, and single-page hidden states", async () => {
    const wrapper = mount(KPagination, {
      props: {
        page: 1,
        pageSize: 20,
        total: 0,
        disabled: true,
      },
    });

    expect(wrapper.text()).toContain("共 0 条");
    expect(
      wrapper
        .findAll("button")
        .every((button) => button.attributes("disabled") !== undefined),
    ).toBe(true);
    expect(wrapper.get("select").attributes("disabled")).toBeDefined();
    expect(wrapper.get("nav").attributes("aria-disabled")).toBe("true");

    await wrapper.setProps({
      disabled: false,
      hideOnSinglePage: true,
    });
    expect(wrapper.find("nav").exists()).toBe(false);
  });
});
