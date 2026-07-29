<script setup lang="ts">
import { computed, ref } from "vue";
import type { Component } from "vue";
import { KIcon } from "../../../../src";
import {
  AccessControlIcon,
  AccessListIcon,
  AdministratorIcon,
  AlertBellIcon,
  AnalyticsIcon,
  ArrowRightIcon,
  AuditIcon,
  BotIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CoinsIcon,
  ConfigurationIcon,
  CopyIcon,
  DashboardIcon,
  EmptyBoxIcon,
  ErrorCircleIcon,
  ErrorIcon,
  ExportIcon,
  GiftIcon,
  InfoIcon,
  LedgerIcon,
  MinusIcon,
  MonitorIcon,
  MoreIcon,
  PartyIcon,
  ReconciliationIcon,
  RefreshIcon,
  RoomIcon,
  SearchIcon,
  SettlementIcon,
  ShieldAlertIcon,
  SlidersIcon,
  SuccessIcon,
  UserIcon,
  WarningIcon,
} from "../../../../src/icons";

interface IconItem {
  readonly name: string;
  readonly component: Component;
}

const query = ref("");
const copiedName = ref("");

const icons: readonly IconItem[] = [
  { name: "AccessControlIcon", component: AccessControlIcon },
  { name: "AccessListIcon", component: AccessListIcon },
  { name: "AdministratorIcon", component: AdministratorIcon },
  { name: "AlertBellIcon", component: AlertBellIcon },
  { name: "AnalyticsIcon", component: AnalyticsIcon },
  { name: "ArrowRightIcon", component: ArrowRightIcon },
  { name: "AuditIcon", component: AuditIcon },
  { name: "BotIcon", component: BotIcon },
  { name: "CheckIcon", component: CheckIcon },
  { name: "ChevronDownIcon", component: ChevronDownIcon },
  { name: "ChevronLeftIcon", component: ChevronLeftIcon },
  { name: "ChevronRightIcon", component: ChevronRightIcon },
  { name: "CloseIcon", component: CloseIcon },
  { name: "CoinsIcon", component: CoinsIcon },
  { name: "ConfigurationIcon", component: ConfigurationIcon },
  { name: "CopyIcon", component: CopyIcon },
  { name: "DashboardIcon", component: DashboardIcon },
  { name: "EmptyBoxIcon", component: EmptyBoxIcon },
  { name: "ErrorCircleIcon", component: ErrorCircleIcon },
  { name: "ErrorIcon", component: ErrorIcon },
  { name: "ExportIcon", component: ExportIcon },
  { name: "GiftIcon", component: GiftIcon },
  { name: "InfoIcon", component: InfoIcon },
  { name: "LedgerIcon", component: LedgerIcon },
  { name: "MinusIcon", component: MinusIcon },
  { name: "MonitorIcon", component: MonitorIcon },
  { name: "MoreIcon", component: MoreIcon },
  { name: "PartyIcon", component: PartyIcon },
  { name: "ReconciliationIcon", component: ReconciliationIcon },
  { name: "RefreshIcon", component: RefreshIcon },
  { name: "RoomIcon", component: RoomIcon },
  { name: "SearchIcon", component: SearchIcon },
  { name: "SettlementIcon", component: SettlementIcon },
  { name: "ShieldAlertIcon", component: ShieldAlertIcon },
  { name: "SlidersIcon", component: SlidersIcon },
  { name: "SuccessIcon", component: SuccessIcon },
  { name: "UserIcon", component: UserIcon },
  { name: "WarningIcon", component: WarningIcon },
];

const filteredIcons = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  return keyword
    ? icons.filter((icon) => icon.name.toLowerCase().includes(keyword))
    : icons;
});

async function copyImport(name: string): Promise<void> {
  await navigator.clipboard.writeText(`import { ${name} } from "kkdui/icons";`);
  copiedName.value = name;
  window.setTimeout(() => {
    if (copiedName.value === name) copiedName.value = "";
  }, 1600);
}
</script>

<template>
  <div class="icon-gallery">
    <label class="icon-gallery__search">
      <span>搜索图标</span>
      <input v-model="query" type="search" placeholder="输入图标名称" />
    </label>

    <div v-if="filteredIcons.length" class="icon-gallery__grid">
      <button
        v-for="item in filteredIcons"
        :key="item.name"
        class="icon-gallery__item"
        type="button"
        :title="`复制 ${item.name} 的导入代码`"
        @click="copyImport(item.name)"
      >
        <KIcon :size="28">
          <component :is="item.component" />
        </KIcon>
        <code>{{ item.name }}</code>
        <small>{{ copiedName === item.name ? "已复制" : "点击复制" }}</small>
      </button>
    </div>

    <p v-else class="icon-gallery__empty">没有匹配的图标。</p>
  </div>
</template>

<style scoped>
.icon-gallery {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.icon-gallery__search {
  display: grid;
  gap: 0.4rem;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 650;
}

.icon-gallery__search input {
  width: min(100%, 24rem);
  height: 2.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.7rem;
  padding: 0 0.8rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  font: inherit;
  outline: 0;
}

.icon-gallery__search input:focus-visible {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 0.2rem
    color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent);
}

.icon-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  border-top: 1px solid var(--vp-c-divider);
  border-left: 1px solid var(--vp-c-divider);
}

.icon-gallery__item {
  min-height: 8.5rem;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.65rem;
  border: 0;
  border-right: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 1rem 0.7rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  cursor: pointer;
  transition:
    color 150ms ease-out,
    background-color 150ms ease-out;
}

.icon-gallery__item:hover,
.icon-gallery__item:focus-visible {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  outline: none;
}

.icon-gallery__item code {
  overflow-wrap: anywhere;
  color: inherit;
  font-size: 0.75rem;
}

.icon-gallery__item small {
  color: var(--vp-c-text-3);
  font-size: 0.66rem;
}

.icon-gallery__empty {
  min-height: 8rem;
  display: grid;
  place-items: center;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
}
</style>
