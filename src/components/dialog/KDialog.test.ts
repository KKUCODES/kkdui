import {
  flushPromises,
  mount
} from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import KDialog from "./KDialog.vue";

describe("KDialog", () => {
  it("traps focus, locks scroll, and restores focus after closing", async () => {
    const previousOverflow = document.body.style.overflow;
    const outsideButton = document.createElement("button");
    document.body.append(outsideButton);
    outsideButton.focus();

    const wrapper = mount(KDialog, {
      attachTo: document.body,
      props: {
        modelValue: true,
        title: "创建管理员",
      },
      slots: {
        default: '<button class="inside-action">保存</button>',
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(
      wrapper.get(".inside-action").element,
    );

    await wrapper.get('button[aria-label="关闭对话框"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([false]);
    expect(wrapper.emitted("close")?.at(-1)).toEqual(["close-button"]);

    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(document.body.style.overflow).toBe(previousOverflow);
    expect(document.activeElement).toBe(outsideButton);

    wrapper.unmount();
    outsideButton.remove();
  });

  it("supports Escape and configurable backdrop dismissal", async () => {
    const wrapper = mount(KDialog, {
      props: {
        modelValue: true,
        closeOnBackdrop: false,
      },
      slots: {
        title: "重置密码",
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();
    const dialog = wrapper.get('[role="dialog"]');
    const labelledBy = dialog.attributes("aria-labelledby");
    expect(labelledBy).toBeDefined();
    expect(wrapper.get(`#${labelledBy}`).text()).toBe("重置密码");

    await wrapper.get(".k-dialog").trigger("mousedown");
    expect(wrapper.emitted("close")).toBeUndefined();

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      }),
    );
    expect(wrapper.emitted("close")?.at(-1)).toEqual(["escape"]);

    wrapper.unmount();
  });

  it("guards unsaved content before every dismissal route", async () => {
    const beforeClose = vi.fn().mockReturnValue(false);
    const wrapper = mount(KDialog, {
      props: {
        modelValue: true,
        title: "编辑配置",
        beforeClose,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    await wrapper.get('button[aria-label="关闭对话框"]').trigger("click");
    await flushPromises();
    expect(beforeClose).toHaveBeenCalledWith("close-button");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("associates a fixed footer submit action with its scrollable form", async () => {
    const wrapper = mount(KDialog, {
      props: {
        modelValue: true,
        title: "创建管理员",
        form: "create-admin",
        mobileFullscreen: true,
      },
      slots: {
        default: '<input name="account" />',
        footer: ({ form }: { form?: string }) =>
          h("button", { type: "submit", form }, "提交"),
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.get(".k-dialog").classes()).toContain(
      "k-dialog--mobile-fullscreen",
    );
    expect(wrapper.get(".k-dialog").classes()).toContain(
      "k-dialog--fixed-footer",
    );
    expect(wrapper.get("form").attributes("id")).toBe("create-admin");
    expect(wrapper.get('button[type="submit"]').attributes("form")).toBe(
      "create-admin",
    );

    await wrapper.get("form").trigger("submit");
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });
});
