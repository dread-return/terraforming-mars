<template>
  <div class="colony-grid-container2" :class="{'colony-grid-wide': (metadata.maxTrackPosition ?? 6) > 6, 'asteroid-belt-trade': metadata.name === ColonyName.ASTEROID_BELT}" :style="{gridTemplateColumns: `repeat(${(metadata.maxTrackPosition ?? 6) + 1}, auto)`}"><!--  style="margin-top:55px;"  if VENUS -->
    <template v-if="metadata.name === ColonyName.MERCURY">
      <div><div class="production-box mercury-production-box"><div class="production heat"></div></div></div>
      <div><div class="production-box mercury-production-box"><div class="production heat"></div></div></div>
      <div><div class="production-box mercury-production-box"><div class="production heat"></div></div></div>
      <div><div class="production-box mercury-production-box"><div class="production steel"></div></div></div>
      <div><div class="production-box mercury-production-box"><div class="production steel"></div></div></div>
      <div><div class="production-box mercury-production-box"><div class="production titanium"></div></div></div>
      <div><div class="production-box mercury-production-box"><div class="production titanium"></div></div></div>
    </template>
    <template v-else-if="metadata.name === ColonyName.HYGIEA">
      <div><div class="resource megacredits red-outline"></div></div>
      <div><div class="resource megacredits red-outline"></div></div>
      <div><div class="resource heat red-outline"></div></div>
      <div><div class="resource energy red-outline"></div></div>
      <div><div class="resource plants red-outline"></div></div>
      <div><div class="resource steel red-outline"></div></div>
      <div><div class="resource titanium red-outline"></div></div>
    </template>
    <template v-else-if="metadata.name === ColonyName.EUROPA">
      <div><div class="production-box"><div class="production megacredits">1</div></div></div>
      <div><div class="production-box"><div class="production megacredits">1</div></div></div>
      <div><div class="production-box"><div class="production energy"></div></div></div>
      <div><div class="production-box"><div class="production energy"></div></div></div>
      <div><div class="production-box"><div class="production plants"></div></div></div>
      <div><div class="production-box"><div class="production plants"></div></div></div>
      <div><div class="production-box"><div class="production plants"></div></div></div>
    </template>
    <template v-else-if="metadata.name === ColonyName.TERRA">
      <div>
        <div class="tile temperature-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -18px;">WGT</span>
        </div>
      </div>
      <div>
        <div class="tile temperature-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -18px;">WGT</span>
        </div>
      </div>
      <div>
        <div class="tile temperature-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -18px;">WGT</span>
        </div>
      </div>
      <div>
        <div class="tile oxygen-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -3px;">WGT</span>
        </div>
      </div>
      <div>
        <div class="tile oxygen-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -3px;">WGT</span>
        </div>
      </div>
      <div>
        <div class="tile ocean-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -3px;">WGT</span>
        </div>
      </div>
      <div>
        <div class="tile ocean-tile" style="transform: scale(0.8);">
          <span style="font-size: 24px;line-height: 45px;margin-left: -3px;">WGT</span>
        </div>
      </div>

    </template>
    <template v-else-if="metadata.name === ColonyName.ASTEROID_BELT">
      <!-- 1 standard resource, 2 standard resources, 1 steel production, 1 asteroid, 1 asteroid + 1 titanium,
           1 asteroid + 1 resource to any card (the rainbow card-resource icon), 2 asteroids + 1 resource to any card -->
      <div><div class="resource wild"></div></div>
      <div><span class="asteroid-belt-count">2</span><div class="resource wild"></div></div>
      <div><div class="production-box"><div class="production steel"></div></div></div>
      <div><div class="resource asteroid"></div></div>
      <div><div class="resource asteroid"></div><div class="resource titanium"></div></div>
      <div><div class="resource asteroid"></div><div class="resource card-resource-wild-resource"></div></div>
      <div><span class="asteroid-belt-count">2</span><div class="resource asteroid"></div><div class="resource card-resource-wild-resource"></div></div>
    </template>
    <template v-else v-for="idx in range((metadata.maxTrackPosition ?? 6) + 1)" :key="idx">
      <div>{{ metadata.trade.quantity[idx] }}</div>
    </template>
  </div>
</template>
<script lang="ts">

import {defineComponent} from 'vue';

import {ColonyName} from '@/common/colonies/ColonyName';
import {ColonyMetadata} from '@/common/colonies/ColonyMetadata';
import {range} from '@/common/utils/utils';

export default defineComponent({
  name: 'ColonyTradeRow',
  props: {
    metadata: {
      type: Object as () => ColonyMetadata,
      required: true,
    },
  },
  computed: {
    ColonyName(): typeof ColonyName {
      return ColonyName;
    },
  },
  methods: {
    range(n: number) {
      return range(n);
    },
  },
});
</script>
