import {
  flushPromises,
  mount
} from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import KAlertDialog from "./KAlertDialog.vue";

describe("KAlertDialog", () => {
  it("separates cancellation from destructive confirmation", async () => {
    const wrapper = mount(KAlertDialog, {
      props: {
        modelValue: true,
        title: "停用账号",
        description: "停用后该管理员将无法登录。",
        confirmText: "确认停用",
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();
    const buttons = wrapper.findAll("button");
    const confirmButton = buttons.find(
      (button) => button.text().trim() === "确认停用",
    );
    const cancelButton = buttons.find(
      (button) => button.text().trim() === "取消",
    );

    await confirmButton!.trigger("click");
    expect(wrapper.emitted("confirm")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    await cancelButton!.trigger("click");
    expect(wrapper.emitted("cancel")?.at(-1)).toEqual(["cancel-button"]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([false]);

    wrapper.unmount();
  });

  it("requires the specified text and a valid operation reason", async () => {
    const wrapper = mount(KAlertDialog, {
      props: {
        modelValue: true,
        title: "解散房间",
        confirmText: "确认解散",
        confirmationText: "ROOM-18",
        reasonRequired: true,
        reasonMinLength: 4,
      },
      slots: {
        "risk-detail": "<div class=\"risk-detail\">将中断 12 名玩家</div>",
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.get(".risk-detail").text()).toContain("12 名玩家");
    const confirmButton = wrapper
      .findAll("button")
      .find((button) => button.text().trim() === "确认解散")!;
    expect(confirmButton.attributes("disabled")).toBeDefined();

    await wrapper.get('input[aria-label="确认文字"]').setValue("ROOM-18");
    await wrapper.get('textarea[aria-label="操作原因"]').setValue("误创建房间");
    expect(wrapper.emitted("update:confirmationValue")?.at(-1)).toEqual([
      "ROOM-18",
    ]);
    expect(wrapper.emitted("update:reason")?.at(-1)).toEqual(["误创建房间"]);
    expect(confirmButton.attributes("disabled")).toBeUndefined();

    await confirmButton.trigger("click");
    expect(wrapper.emitted("confirm")?.at(-1)).toEqual([
      {
        confirmationValue: "ROOM-18",
        reason: "误创建房间",
      },
    ]);
  });

  it("supports an optional second-confirmation countdown", async () => {
    vi.useFakeTimers();
    const wrapper = mount(KAlertDialog, {
      props: {
        modelValue: true,
        title: "扣除金币",
        confirmText: "确认扣除",
        confirmCountdown: 2,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("确认扣除（2 秒）");
    vi.advanceTimersByTime(2000);
    await nextTick();
    const confirmButton = wrapper
      .findAll("button")
      .find((button) => button.text().trim() === "确认扣除")!;
    expect(confirmButton.attributes("disabled")).toBeUndefined();

    wrapper.unmount();
    vi.useRealTimers();
  });
});
