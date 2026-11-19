<template>
  <div class="colony-grid-container" :class="{'colony-grid-wide': positions.length > 7}" :style="{gridTemplateColumns: `repeat(${positions.length}, auto)`}">
    <ColonySpace v-for="idx in positions"
      :key="idx"
      :idx="idx"
      :metadata="metadata"
      :player="colony.colonies[idx]"
      :marker="hasTrack && colony.isActive && colony.trackPosition === idx"
      :fadeMarker="fadeMarker" />
  </div>
</template>
<script lang="ts">

import {defineComponent} from 'vue';

import {ColonyMetadata} from '@/common/colonies/ColonyMetadata';
import {ColonyModel} from '@/common/models/ColonyModel';
import ColonySpace from './ColonySpace.vue';
import {ColonyName} from '@/common/colonies/ColonyName';

export default defineComponent({
  name: 'ColonyRow',
  components: {
    ColonySpace,
  },
  props: {
    metadata: {
      type: Object as () => ColonyMetadata,
      required: true,
    },
    colony: {
      type: Object as () => ColonyModel,
      required: true,
    },
    fadeMarker: {
      type: Boolean,
    },
  },
  computed: {
    // Market Colonies (Mercury vs Mars) trades from its market, so it has no track marker.
    hasTrack(): boolean {
      return this.metadata.name !== ColonyName.MARKET_COLONIES;
    },
    // Shadow Colonies (Mercury vs Mars) has 8 steps; Market Colonies has only its 4 colony spaces.
    positions(): Array<number> {
      const last = this.metadata.maxTrackPosition ?? 6;
      const count = Math.max(last + 1, this.metadata.colonySpaces ?? 0);
      return Array.from({length: this.metadata.name === ColonyName.MARKET_COLONIES ? 4 : count}, (_, i) => i);
    },
  },
});
</script>
