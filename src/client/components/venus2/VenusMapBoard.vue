<template>
  <div class="board-cont venus-map-board">
    <div class="venus-map-title" v-i18n>Venus</div>
    <div class="venus-map-legend">
      <div class="venus-map-legend-hex venus-map-space-type-gas"></div>
      <span v-i18n>Gas Mines only</span>
    </div>
    <!-- Labels sit outside the hexes so the hex clip-path doesn't cut them. -->
    <div v-for="label in reservedLabels" :key="label.id" :class="'venus-map-label venus-map-label-' + label.id" v-i18n>{{ label.text }}</div>
    <!-- SelectSpace and log highlighting look for spaces inside #venus_map_board. -->
    <div class="board" id="venus_map_board">
      <VenusMapSpace
        v-for="space in sortedSpaces"
        :key="space.id"
        :space="space"
        :tileView="tileView"
        data-test="venus-map-space"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {VenusMapModel} from '@/common/models/VenusMapModel';
import {SpaceModel} from '@/common/models/SpaceModel';
import {TileView} from '@/client/components/board/TileView';
import VenusMapSpace from '@/client/components/venus2/VenusMapSpace.vue';
import {NamedVenusSpaces} from '@/common/venus2/NamedVenusSpaces';
import {comparing} from '@/common/utils/Ordering';

export default defineComponent({
  name: 'VenusMapBoard',
  props: {
    model: {
      type: Object as () => VenusMapModel,
      required: true,
    },
    tileView: {
      type: String as () => TileView,
      default: 'show',
    },
  },
  components: {
    VenusMapSpace,
  },
  computed: {
    sortedSpaces(): Array<SpaceModel> {
      return this.model.spaces.toSorted(comparing((space) => parseInt(space.id.substring(1))));
    },
    /** Names of the reserved spaces, while they are empty. */
    reservedLabels(): Array<{id: string, text: string}> {
      const labels = [
        {id: NamedVenusSpaces.STRATOPOLIS, text: 'Stratopolis'},
        {id: NamedVenusSpaces.MAXWELL_BASE, text: 'Maxwell Base'},
      ];
      return labels.filter((label) => this.model.spaces.find((space) => space.id === label.id)?.tileType === undefined);
    },
  },
});
</script>
