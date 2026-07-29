import {
  inject,
  type InjectionKey
} from "vue";
import type { KToastApi } from "./types";

export const kToastKey: InjectionKey<KToastApi> = Symbol("KToast");

export function useKToast(): KToastApi {
  const toast = inject(kToastKey);
  if (toast === undefined) {
    throw new Error("useKToast 必须在 KToastProvider 内使用");
  }

  return toast;
}
