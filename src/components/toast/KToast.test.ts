import {
  flushPromises,
  mount
} from "@vue/test-utils";
import {
  defineComponent,
  h,
  nextTick
} from "vue";
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";
import KToast from "./KToast.vue";
import KToastProvider from "./KToastProvider.vue";
import { useKToast } from "./context";
import type { KToastApi } from "./types";

afterEach(() => {
  vi.useRealTimers();
});

describe("KToast", () => {
  it("pauses automatic dismissal while the user is interacting", async () => {
    vi.useFakeTimers();
    const wrapper = mount(KToast, {
      props: {
        id: "save",
        title: "保存成功",
        duration: 1000,
      },
    });

    await vi.advanceTimersByTimeAsync(500);
    await wrapper.trigger("mouseenter");
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.emitted("dismiss")).toBeUndefined();

    await wrapper.trigger("mouseleave");
    await vi.advanceTimersByTimeAsync(500);
    expect(wrapper.emitted("dismiss")?.at(-1)).toEqual(["save"]);
  });

  it("provides an imperative API and renders its toast viewport", async () => {
    const ToastHarness = defineComponent({
      setup() {
        const toast = useKToast();
        return () =>
          h(
            "button",
            {
              class: "show-toast",
              onClick: () =>
                toast.success("管理员已创建", {
                  description: "新账号现在可以登录。",
                  duration: 0,
                }),
            },
            "显示通知",
          );
      },
    });
    const wrapper = mount(KToastProvider, {
      slots: {
        default: () => h(ToastHarness),
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });

    await wrapper.get(".show-toast").trigger("click");
    await nextTick();
    expect(wrapper.get('[role="status"]').text()).toContain("管理员已创建");
    expect(wrapper.text()).toContain("新账号现在可以登录。");

    await wrapper.get('button[aria-label="关闭通知"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it("updates persistent progress and deduplicates repeated danger messages", async () => {
    vi.useFakeTimers();
    const wrapper = mount(KToastProvider, {
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    const toast = wrapper.vm as unknown as KToastApi;
    const id = toast.show({
      title: "正在同步",
      persistent: true,
      progress: 0.2,
      dedupeKey: "sync-task",
    });
    const duplicateId = toast.show({
      title: "同步连接失败",
      tone: "danger",
      dedupeKey: "sync-task",
    });
    await nextTick();

    expect(duplicateId).toBe(id);
    expect(wrapper.findAll(".k-toast")).toHaveLength(1);
    expect(wrapper.text()).toContain("同步连接失败");
    expect(wrapper.get('[role="progressbar"]').attributes("aria-valuenow")).toBe(
      "20",
    );

    expect(toast.update(id, { title: "同步恢复", progress: 0.75 })).toBe(true);
    await nextTick();
    expect(wrapper.text()).toContain("同步恢复");
    expect(wrapper.get('[role="progressbar"]').attributes("aria-valuenow")).toBe(
      "75",
    );

    await vi.advanceTimersByTimeAsync(60_000);
    expect(wrapper.find(".k-toast").exists()).toBe(true);
  });

  it("tracks promise loading, success, and failure in the same toast", async () => {
    const wrapper = mount(KToastProvider, {
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    const toast = wrapper.vm as unknown as KToastApi;
    let resolveTask!: (value: number) => void;
    const task = new Promise<number>((resolve) => {
      resolveTask = resolve;
    });
    const trackedTask = toast.promise(task, {
      loading: "正在保存",
      success: (value) => `已保存 ${value} 项`,
      error: "保存失败",
    });
    await nextTick();
    expect(wrapper.text()).toContain("正在保存");

    resolveTask(3);
    await expect(trackedTask).resolves.toBe(3);
    await nextTick();
    expect(wrapper.findAll(".k-toast")).toHaveLength(1);
    expect(wrapper.text()).toContain("已保存 3 项");
    expect(wrapper.get(".k-toast").classes()).toContain("k-toast--success");

    toast.clear();
    const failedTask = toast.promise(
      Promise.reject(new Error("网络中断")),
      {
        loading: "正在发布",
        success: "发布成功",
        error: (error) => `发布失败：${(error as Error).message}`,
      },
    );
    await expect(failedTask).rejects.toThrow("网络中断");
    await nextTick();
    expect(wrapper.text()).toContain("发布失败：网络中断");
    expect(wrapper.get(".k-toast").classes()).toContain("k-toast--danger");
  });
});
