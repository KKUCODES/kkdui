import { h, nextTick, type Component } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import KTable from "./KTable.vue";
import type { KTableColumn } from "./types";

// Vue Test Utils cannot currently infer the row type of a generic SFC.
const TestKTable = KTable as Component;

interface UserRow {
  id: number;
  name: string;
  status: string;
}

const columns: KTableColumn<UserRow>[] = [
  {
    key: "name",
    title: "姓名",
    accessor: "name",
    sortable: true,
  },
  {
    key: "status",
    title: "状态",
    accessor: "status",
  },
];

const rows: UserRow[] = [
  { id: 1, name: "林澈", status: "启用" },
  { id: 2, name: "周禾", status: "停用" },
];

describe("KTable", () => {
  it("renders rows and supports dynamic cell slots", async () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        caption: "用户列表",
      },
      slots: {
        "cell-status": ({ row }: { row: UserRow }) =>
          h("strong", { class: "status-cell" }, row.status),
      },
    });

    expect(wrapper.get("caption").text()).toBe("用户列表");
    expect(wrapper.text()).toContain("林澈");
    expect(wrapper.text()).toContain("周禾");
    expect(wrapper.findAll(".status-cell")).toHaveLength(2);

    await wrapper.get('tr[data-row-key="1"]').trigger("click");
    expect(wrapper.emitted("rowClick")).toBeUndefined();
  });

  it("supports a compact desktop density", () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        size: "small",
      },
    });

    expect(wrapper.get(".k-table").classes()).toContain("k-table--small");
  });

  it("cycles controlled sorting through ascending, descending, and cleared", async () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        sort: null,
      },
    });
    const sortButton = wrapper.get('button[aria-label="按姓名升序排列"]');

    await sortButton.trigger("click");
    expect(wrapper.emitted("update:sort")?.at(-1)).toEqual([
      { key: "name", direction: "asc" },
    ]);

    await wrapper.setProps({
      sort: { key: "name", direction: "asc" },
    });
    expect(wrapper.get("th").attributes("aria-sort")).toBe("ascending");
    expect(sortButton.attributes("aria-label")).toBe("按姓名降序排列");

    await sortButton.trigger("click");
    expect(wrapper.emitted("update:sort")?.at(-1)).toEqual([
      { key: "name", direction: "desc" },
    ]);

    await wrapper.setProps({
      sort: { key: "name", direction: "desc" },
    });
    expect(sortButton.attributes("aria-label")).toBe("清除姓名排序");
    await sortButton.trigger("click");
    expect(wrapper.emitted("update:sort")?.at(-1)).toEqual([null]);
  });

  it("preserves off-page selections and exposes the indeterminate state", async () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        selectable: true,
        selectedRowKeys: ["outside-page"],
      },
    });

    await wrapper.get('input[aria-label="选择第 1 行"]').setValue(true);
    expect(wrapper.emitted("update:selectedRowKeys")?.at(-1)).toEqual([
      ["outside-page", 1],
    ]);

    await wrapper.setProps({ selectedRowKeys: ["outside-page", 1] });
    await nextTick();
    const selectAll = wrapper.get(
      'input[aria-label="选择全部当前行"]',
    ).element as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);

    await wrapper.get('input[aria-label="选择全部当前行"]').setValue(true);
    expect(wrapper.emitted("update:selectedRowKeys")?.at(-1)).toEqual([
      ["outside-page", 1, 2],
    ]);
  });

  it("renders loading, empty, and error states with retry support", async () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows: [],
        rowKey: "id",
        loading: true,
        loadingRowCount: 4,
      },
    });

    expect(wrapper.get("table").attributes("aria-busy")).toBe("true");
    expect(wrapper.findAll(".k-table__loading-row")).toHaveLength(4);

    await wrapper.setProps({ loading: false });
    expect(wrapper.text()).toContain("暂无数据");

    await wrapper.setProps({
      error: "数据加载失败",
      showRetry: true,
    });
    expect(wrapper.get('[role="alert"]').text()).toContain("数据加载失败");

    const retryButton = wrapper
      .findAll("button")
      .find((button) => button.text().trim() === "重新加载");
    expect(retryButton).toBeDefined();
    await retryButton!.trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("supports keyboard activation for interactive rows", async () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        interactiveRows: true,
      },
    });
    const firstRow = wrapper.get('tr[data-row-key="1"]');

    expect(firstRow.attributes("tabindex")).toBe("0");
    await firstRow.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("rowClick")?.at(-1)).toEqual([rows[0], 0]);

    await firstRow.trigger("keydown", { key: " " });
    expect(wrapper.emitted("rowClick")).toHaveLength(2);
  });

  it("expands row details and announces the state from the toggle", async () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        expandable: true,
        expandedRowKeys: [],
      },
      slots: {
        detail: ({ row }: { row: UserRow }) =>
          h("p", { class: "row-detail" }, `${row.name}的详情`),
      },
    });

    const toggle = wrapper.get('button[aria-label="展开第 1 行详情"]');
    expect(toggle.attributes("aria-expanded")).toBe("false");
    await toggle.trigger("click");

    expect(wrapper.emitted("update:expandedRowKeys")?.at(-1)).toEqual([[1]]);
    await wrapper.setProps({ expandedRowKeys: [1] });
    expect(wrapper.get(".row-detail").text()).toBe("林澈的详情");
    expect(wrapper.get('button[aria-label="收起第 1 行详情"]').attributes(
      "aria-expanded",
    )).toBe("true");
  });

  it("supports visible and fixed columns, header hints, and a shared empty-value policy", () => {
    const enhancedColumns: KTableColumn<UserRow>[] = [
      { ...columns[0], fixed: "left" },
      { ...columns[1], headerHint: "账号当前状态" },
      { key: "operation", title: "操作", fixed: "right" },
    ];
    const wrapper = mount(TestKTable, {
      props: {
        columns: enhancedColumns,
        rows,
        rowKey: "id",
        visibleColumnKeys: ["name", "operation"],
        emptyValue: "未提供",
      },
      slots: {
        "header-tooltip-name": () => h("span", { class: "name-hint" }, "姓名说明"),
      },
    });

    expect(wrapper.findAll("thead th")).toHaveLength(2);
    expect(wrapper.get(".name-hint").text()).toBe("姓名说明");
    expect(wrapper.get('th[data-column-key="name"]').classes()).toContain(
      "is-fixed-left",
    );
    expect(wrapper.get('th[data-column-key="operation"]').classes()).toContain(
      "is-fixed-right",
    );
    expect(wrapper.get('td[data-column-key="operation"]').text()).toBe("未提供");
  });

  it("exposes selection summary, cross-page count, and row status to slots", () => {
    const wrapper = mount(TestKTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
        selectable: true,
        selectedRowKeys: ["outside-page", 1],
        rowStatus: (row: UserRow) =>
          row.status === "停用" ? "danger" : "success",
      },
      slots: {
        "selection-summary": ({
          selectedCount,
          outsidePageCount,
        }: {
          selectedCount: number;
          outsidePageCount: number;
        }) => h("span", { class: "selection-summary" }, `${selectedCount}/${outsidePageCount}`),
      },
    });

    expect(wrapper.get(".selection-summary").text()).toBe("2/1");
    expect(wrapper.get('tr[data-row-key="1"]').attributes("data-row-status")).toBe(
      "success",
    );
    expect(wrapper.get('tr[data-row-key="2"]').classes()).toContain(
      "is-status-danger",
    );
  });
});
