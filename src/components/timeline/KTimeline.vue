<script setup lang="ts">
import type {
  KTimelineItem,
  KTimelineProps
} from "./types";

withDefaults(defineProps<KTimelineProps>(), {
  ariaLabel: "事件记录",
  compact: false,
  pending: false,
  pendingText: "处理中",
  emptyText: "暂无记录"
});
</script>

<template>
  <ol
    class="k-timeline"
    :class="{ 'k-timeline--compact': compact }"
    :aria-label="ariaLabel"
  >
    <li
      v-for="(item, index) in items"
      :key="item.key"
      class="k-timeline__item"
      :class="`k-timeline__item--${item.tone ?? 'neutral'}`"
    >
      <div class="k-timeline__rail" aria-hidden="true">
        <span class="k-timeline__dot">
          <slot name="icon" :item="item" :index="index"></slot>
        </span>
        <span
          v-if="index < items.length - 1 || pending"
          class="k-timeline__line"
        ></span>
      </div>
      <article class="k-timeline__content">
        <slot name="item" :item="item" :index="index">
          <div class="k-timeline__heading">
            <h3>{{ item.title }}</h3>
            <time v-if="item.timestamp" :datetime="item.datetime">
              {{ item.timestamp }}
            </time>
          </div>
          <p v-if="item.description" class="k-timeline__description">
            {{ item.description }}
          </p>
          <div
            v-if="item.actor || item.status"
            class="k-timeline__meta"
          >
            <span v-if="item.actor">{{ item.actor }}</span>
            <slot
              v-if="item.status"
              name="status"
              :item="item"
              :status="item.status"
            >
              <span class="k-timeline__status">{{ item.status }}</span>
            </slot>
          </div>
        </slot>
      </article>
    </li>

    <li
      v-if="pending"
      class="k-timeline__item k-timeline__item--pending"
      aria-live="polite"
    >
      <div class="k-timeline__rail" aria-hidden="true">
        <span class="k-timeline__dot"></span>
      </div>
      <p class="k-timeline__pending">{{ pendingText }}</p>
    </li>

    <li v-if="items.length === 0 && !pending" class="k-timeline__empty">
      {{ emptyText }}
    </li>
  </ol>
</template>

<style scoped>
.k-timeline {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  color: var(--k-color-text, #1d2725);
  list-style: none;
}

.k-timeline__item {
  --k-timeline-accent: #7b8884;

  min-width: 0;
  display: grid;
  grid-template-columns: 1.3rem minmax(0, 1fr);
  gap: 0.72rem;
}

.k-timeline__item--accent {
  --k-timeline-accent: var(--k-color-primary, #257360);
}

.k-timeline__item--success {
  --k-timeline-accent: var(--k-color-success, #28745c);
}

.k-timeline__item--warning {
  --k-timeline-accent: var(--k-color-warning, #9a6c16);
}

.k-timeline__item--danger {
  --k-timeline-accent: var(--k-color-danger, #b34a4a);
}

.k-timeline__rail {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.k-timeline__dot {
  width: 0.78rem;
  height: 0.78rem;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 0.18rem solid color-mix(
    in srgb,
    var(--k-timeline-accent) 18%,
    white
  );
  border-radius: 50%;
  margin-top: 0.24rem;
  background: var(--k-timeline-accent);
  box-shadow: 0 0 0 1px color-mix(
    in srgb,
    var(--k-timeline-accent) 18%,
    transparent
  );
}

.k-timeline__dot :deep(svg) {
  width: 0.48rem;
  height: 0.48rem;
  color: #fff;
}

.k-timeline__line {
  width: 1px;
  min-height: 1rem;
  flex: 1;
  margin: 0.25rem 0;
  background: var(--k-color-border, rgba(72, 94, 88, 0.19));
}

.k-timeline__content {
  min-width: 0;
  padding-bottom: 1.25rem;
}

.k-timeline__heading {
  min-width: 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
}

.k-timeline__heading h3 {
  min-width: 0;
  margin: 0;
  font-size: 0.79rem;
  font-weight: 650;
  letter-spacing: -0.008em;
  line-height: 1.45;
}

.k-timeline__heading time {
  flex: 0 0 auto;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.65rem;
  line-height: 1.45;
  white-space: nowrap;
}

.k-timeline__description,
.k-timeline__pending {
  margin: 0.28rem 0 0;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.72rem;
  line-height: 1.58;
}

.k-timeline__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.42rem;
  margin-top: 0.38rem;
  color: var(--k-color-text-subtle, #929d99);
  font-size: 0.65rem;
}

.k-timeline__status {
  border-radius: 999px;
  padding: 0.12rem 0.38rem;
  color: var(--k-timeline-accent);
  background: color-mix(
    in srgb,
    var(--k-timeline-accent) 9%,
    transparent
  );
  font-weight: 620;
}

.k-timeline__item--pending .k-timeline__dot {
  background: transparent;
  border-color: var(--k-timeline-accent);
  animation: k-timeline-pulse 1.5s ease-in-out infinite;
}

.k-timeline__pending {
  margin-top: 0;
  padding-bottom: 0.5rem;
}

.k-timeline__empty {
  padding: 1.5rem 1rem;
  color: var(--k-color-text-muted, #65706d);
  font-size: 0.75rem;
  text-align: center;
}

.k-timeline--compact .k-timeline__content {
  padding-bottom: 0.78rem;
}

@keyframes k-timeline-pulse {
  50% {
    opacity: 0.45;
  }
}

@media (max-width: 40rem) {
  .k-timeline__heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.12rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-timeline__item--pending .k-timeline__dot {
    animation: none;
  }
}

@media (prefers-contrast: more) {
  .k-timeline__line {
    background: var(--k-color-text, #1d2725);
  }
}
</style>
