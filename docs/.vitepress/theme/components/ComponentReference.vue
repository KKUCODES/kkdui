<script setup lang="ts">
import { computed } from "vue";
import { componentDocs, type ComponentDocSlug } from "../../componentDocs";
import ComponentShowcase from "./ComponentShowcase.vue";
import DemoBlock from "./DemoBlock.vue";

const props = defineProps<{
  slug: ComponentDocSlug;
}>();

const doc = computed(() => componentDocs[props.slug]);
const typeUrl = computed(
  () =>
    `https://github.com/KKUCODES/kkdui/blob/main/src/components/${props.slug}/types.ts`,
);
</script>

<template>
  <div class="component-reference">
    <h2 id="基础用法">基础用法</h2>
    <p>{{ doc.usage }}</p>
    <DemoBlock :code="doc.code">
      <ClientOnly>
        <ComponentShowcase :slug="slug" />
        <template #fallback>
          <div class="component-reference__fallback">正在加载组件示例…</div>
        </template>
      </ClientOnly>
    </DemoBlock>

    <h2 id="常用-api">常用 API</h2>
    <div class="component-reference__table">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>说明</th>
            <th>类型</th>
            <th>默认值</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in doc.api" :key="item.name">
            <td>
              <code>{{ item.name }}</code>
            </td>
            <td>{{ item.description }}</td>
            <td>
              <code>{{ item.type }}</code>
            </td>
            <td>
              <code>{{ item.default ?? "—" }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="doc.events?.length">
      <h3 id="events">Events</h3>
      <div class="component-reference__table">
        <table>
          <thead>
            <tr>
              <th>事件</th>
              <th>说明</th>
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in doc.events" :key="event.name">
              <td>
                <code>{{ event.name }}</code>
              </td>
              <td>{{ event.description }}</td>
              <td>
                <code>{{ event.payload }}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <p class="component-reference__types">
      这里只列出最常用接口。完整泛型、回调和联合类型请查看
      <a :href="typeUrl" target="_blank" rel="noreferrer">
        TypeScript 类型定义
      </a>
      。
    </p>
  </div>
</template>
