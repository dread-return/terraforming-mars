<template>
  <div :class="klass">
    <div class="card-container global-event-container">
      <div class="card-content-wrapper" v-i18n>
        <CardParty class="card-party--revealed" :party="revealed" />
        <CardParty class="card-party--current" :party="current" />
        <div ref="title" class="global-event-title">{{ globalEventName }}</div>
        <div ref="content" class="card-content global-event-card-content">
          <CardRenderData v-if="renderData !== undefined" :renderData="renderData" />
          <CardDescription :item="description" />
        </div>
      </div>
    </div>
    <span v-if="showDistance" class="global-event-distance" v-i18n>{{ type }}</span>
    <slot></slot>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import CardRenderData from '@/client/components/card/CardRenderData.vue';
import CardParty from '@/client/components/card/CardParty.vue';
import {ClientGlobalEvent} from '@/common/turmoil/ClientGlobalEvent';
import {getGlobalEvent} from '@/client/turmoil/ClientGlobalEventManifest';
import CardDescription from '@/client/components/card/CardDescription.vue';
import {GlobalEventName} from '@/common/turmoil/globalEvents/GlobalEventName';
import {ICardRenderRoot} from '@/common/cards/render/Types';
import {PartyName} from '@/common/turmoil/PartyName';
import {fitTextWhenReady} from '@/client/utils/textFit';

export type RenderType = 'coming' | 'current' | 'distant' | 'prior';

type Refs = {
  title: HTMLElement | undefined;
  content: HTMLElement | undefined;
};

// The card's text box (see .global-event-card-content in turmoil.less).
const CONTENT_WIDTH = 300;
const CONTENT_HEIGHT = 118;
// Don't shrink an event's text below this; past it, the box scrolls instead.
const MIN_CONTENT_ZOOM = 0.6;

function overflows(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
}

function setContentZoom(el: HTMLElement, zoom: number): void {
  // Zoomed out, the box is given more room (in its own pixels) so it still covers the same area on the card.
  el.style.setProperty('zoom', String(zoom));
  el.style.setProperty('width', `${CONTENT_WIDTH / zoom}px`, 'important');
  el.style.setProperty('height', `${CONTENT_HEIGHT / zoom}px`, 'important');
}

/**
 * Some events have more icons or text than their card has room for. Zooms the event's content out just enough for it
 * to fit (text re-wraps into the extra room), down to MIN_CONTENT_ZOOM; an event that still doesn't fit scrolls.
 */
export function fitGlobalEventContent(el: HTMLElement): void {
  el.style.removeProperty('zoom');
  el.style.removeProperty('width');
  el.style.removeProperty('height');
  el.style.removeProperty('overflow-y');
  if (!overflows(el)) {
    return;
  }
  setContentZoom(el, MIN_CONTENT_ZOOM);
  if (overflows(el)) {
    el.style.setProperty('overflow-y', 'auto');
    return;
  }
  let low = MIN_CONTENT_ZOOM;
  let high = 1;
  for (let i = 0; i < 6; i++) {
    const mid = (low + high) / 2;
    setContentZoom(el, mid);
    if (overflows(el)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  setContentZoom(el, low);
}

export default defineComponent({
  name: 'GlobalEvent',
  components: {
    CardRenderData,
    CardParty,
    CardDescription,
  },
  mounted() {
    this.fitTitle();
    this.fitContent();
  },
  watch: {
    // Turmoil.vue renders each distant/coming/current slot without a :key, so as the game
    // proceeds the same component instance can get a new globalEventName without remounting.
    globalEventName() {
      this.fitTitle();
      this.$nextTick(() => this.fitContent());
    },
  },
  props: {
    globalEventName: {
      type: String as () => GlobalEventName,
      required: true,
    },
    type: {
      type: String as () => RenderType,
      required: true,
    },
    showDistance: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    fitTitle(): void {
      fitTextWhenReady(this.typedRefs.title, 'global-event-title');
    },
    fitContent(): void {
      const fit = () => {
        const el = this.typedRefs.content;
        if (el !== undefined && el.isConnected) {
          fitGlobalEventContent(el);
        }
      };
      fit();
      // Measure again with the real fonts, which change the text's size.
      document.fonts?.ready.then(fit);
    },
  },
  computed: {
    globalEvent(): ClientGlobalEvent {
      const globalEvent = getGlobalEvent(this.globalEventName);
      if (globalEvent === undefined) {
        throw new Error(`Can't find card ${this.globalEventName}`);
      }
      return globalEvent;
    },
    renderData(): ICardRenderRoot {
      return this.globalEvent.renderData;
    },
    revealed(): PartyName {
      return this.globalEvent.revealedDelegate;
    },
    current(): PartyName {
      return this.globalEvent.currentDelegate;
    },
    description(): string {
      return this.globalEvent.description;
    },
    klass(): string {
      const common = 'global-event global-event--' + this.type;
      if (this.showDistance) {
        return common + ' global-event--show-distance';
      }
      return common;
    },
    typedRefs(): Refs {
      return this.$refs as unknown as Refs;
    },
  },
});

</script>
