import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KEmptyState from "../empty-state/KEmptyState.vue";
import KErrorState from "../error-state/KErrorState.vue";
import KLoadingState from "./KLoadingState.vue";

describe("page-level states", () => {
  it("renders layout-matching loading skeletons", async () => {
    const wrapper = mount(KLoadingState, {
      props: {
        rows: 3,
      },
    });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.findAll(".k-loading-state__rows > span")).toHaveLength(3);

    await wrapper.setProps({ rows: 0 });
    expect(wrapper.findAll(".k-loading-state__rows > span")).toHaveLength(1);
  });

  it("offers a concrete empty-state action", async () => {
    const wrapper = mount(KEmptyState, {
      props: {
        title: "暂无管理员",
        actionText: "创建管理员",
      },
    });

    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("action")).toHaveLength(1);
  });

  it("announces errors and emits retry", async () => {
    const wrapper = mount(KErrorState, {
      props: {
        description: "管理员列表加载失败。",
      },
    });

    expect(wrapper.get('[role="alert"]').text()).toContain(
      "管理员列表加载失败。",
    );
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
