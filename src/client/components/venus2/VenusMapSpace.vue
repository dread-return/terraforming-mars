<template>
  <div :class="mainClass" :data_space_id="space.id">
    <BoardSpaceTile
      :space="space"
      :aresExtension="false"
      :tileView="tileView"
    />
    <div class="board-space-text" v-if="text" v-i18n>{{ text }}</div>
    <Bonus v-if="space.tileType === undefined || tileView === 'hide'" :bonus="space.bonus" />
    <template v-if="tileView === 'coords'">
      <div class="board-space-coords">{{ space.a9 ?? 'n/a' }}</div>
    </template>
    <div v-if="space.color !== undefined && tileView === 'show'" :class="playerColorCss"></div>
    <div v-if="space.coOwner !== undefined && tileView === 'show'" :class="coOwnerColorCss"></div>
    <div class="board-log-highlight" :data_log_highlight_id="space.id"></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import Bonus from '@/client/components/Bonus.vue';
import {TileView} from '@/client/components/board/TileView';
import BoardSpaceTile from '@/client/components/board/BoardSpaceTile.vue';
import {getPreferences} from '@/client/utils/PreferencesManager';

export default defineComponent({
  name: 'VenusMapSpace',
  props: {
    space: {
      type: Object as () => SpaceModel,
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    tileView: {
      type: String as () => TileView,
      default: 'show',
    },
  },
  components: {
    Bonus,
    BoardSpaceTile,
  },
  computed: {
    mainClass(): string {
      let css = 'board-space venus-map-space-' + this.space.id + ' board-space-selectable';
      css += this.space.spaceType === SpaceType.VENUS_GAS_MINE ? ' venus-map-space-type-gas' : ' venus-map-space-type-other';
      return css;
    },
    playerColorCss(): string {
      if (this.space.color === undefined) {
        return '';
      }
      const css = 'board-cube board-cube--' + this.space.color;
      return getPreferences().symbol_overlay ? css + ' overlay' : css;
    },
    coOwnerColorCss(): string {
      if (this.space.coOwner === undefined) {
        return '';
      }
      const css = 'board-cube-coOwner board-cube--' + this.space.coOwner;
      return getPreferences().symbol_overlay ? css + ' overlay' : css;
    },
  },
});
</script>
