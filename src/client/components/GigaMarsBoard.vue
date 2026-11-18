<!--
  The fan GIGA expansion's board: its Mars map (175 spaces on the printed board art, with the
  printed bonus icons removed so the client draws them like on every other map), its global parameter
  tracks and the off-Mars spaces.
-->
<template>
  <div class="board-cont board-cont--giga">
    <div class="hide-tile-button-container">
      <div class="hide-tile-button" @click="$emit('toggleTileView')" data-test="hide-tiles-button" v-i18n>
        {{ tileView }} tiles
      </div>
    </div>

    <div class="giga-tracks">
      <div v-for="track in tracks" :key="track.id" class="giga-track" :class="'giga-track--' + track.id" :data-test="'giga-track-' + track.id">
        <div class="giga-track-label" :class="track.iconClass" :title="$t(track.title)"></div>
        <div class="giga-track-bar">
          <div class="giga-track-fill" :style="{width: track.percent + '%'}"></div>
          <div v-for="(bonus, idx) in track.bonuses" :key="idx" class="giga-track-bonus" :style="{left: bonus.percent + '%'}" :title="$t(bonus.title)">
            <span>{{ bonus.label }}</span>
          </div>
        </div>
        <div class="giga-track-value" :data-test="'giga-track-value-' + track.id">
          <img v-if="track.done" width="18" src="assets/misc/circle-checkmark.png" :alt="$t('Completed!')">
          <template v-else>{{ track.text }}</template>
        </div>
      </div>
    </div>

    <div class="board board--giga" id="main_board">
      <BoardSpace
        v-for="space in marsSpaces"
        :key="space.id"
        :space="space"
        :style="positionStyle(space)"
        :aresExtension="expansions.ares"
        :nuclearExpansion="expansions.nuclear"
        :tileView="tileView"
        data-test="board-space"
      />
    </div>

    <div class="giga-outer-spaces" id="colony_spaces">
      <div v-for="space in offMarsSpaces" :key="space.id" class="giga-outer-space">
        <BoardSpace :space="space" :text="spaceName(space)" :tileView="tileView" style="margin: 0" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import * as constants from '@/common/constants';
import BoardSpace from '@/client/components/BoardSpace.vue';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceId} from '@/common/Types';
import {TileView} from '@/client/components/board/TileView';
import {BoardName} from '@/common/boards/BoardName';
import {Expansion} from '@/common/cards/GameModule';
import {SpaceName} from '@/common/boards/SpaceName';
import {getGlobalParameterMaximums} from '@/common/boards/GlobalParameterMaximums';
import {GIGA_SPACES} from '@/common/boards/gigaMap';

// Where the spaces sit on the board art (assets/board/giga-mars.jpg, drawn at 908x475): the center of
// the first hex of the top row, and the distance between neighbouring hexes and rows.
const FIRST_HEX_X = 197.3;
const FIRST_HEX_Y = 33.3;
const HEX_STEP_X = 47.03;
const ROW_STEP_Y = 40.44;
const SPACE_WIDTH = 46;
const SPACE_HEIGHT = 51;

const POSITIONS: ReadonlyMap<SpaceId, {left: number, top: number}> = new Map(GIGA_SPACES.map((s) => {
  const x = FIRST_HEX_X + s.column * HEX_STEP_X + (s.row % 2) * HEX_STEP_X / 2;
  const y = FIRST_HEX_Y + s.row * ROW_STEP_Y;
  return [s.id, {left: Math.round(x - SPACE_WIDTH / 2), top: Math.round(y - SPACE_HEIGHT / 2)}];
}));

const OFF_MARS_NAMES: Partial<Record<SpaceId, string>> = {
  [SpaceName.GANYMEDE_COLONY]: 'Ganymede Colony',
  [SpaceName.PHOBOS_SPACE_HAVEN]: 'Phobos Space Haven',
  [SpaceName.STANFORD_TORUS]: 'Stanford Torus',
  [SpaceName.LUNA_METROPOLIS]: 'Luna Metropolis',
  [SpaceName.DAWN_CITY]: 'Dawn City',
  [SpaceName.STRATOPOLIS]: 'Stratopolis',
  [SpaceName.MAXWELL_BASE]: 'Maxwell Base',
  [SpaceName.CERES_SPACEPORT]: 'Ceres Spaceport',
  [SpaceName.DYSON_SCREENS]: 'Dyson Screens',
  [SpaceName.LUNAR_EMBASSY]: 'Lunar Embassy',
  [SpaceName.VENERA_BASE]: 'Venera Base',
  [SpaceName.SIDERALIS]: 'Sideralis',
  [SpaceName.MAIN_DOCKING_STATION]: 'Main Docking Station',
  [SpaceName.NEW_POMPEII]: 'New Pompeii (Mercury)',
  [SpaceName.SHADOW_FOREST]: 'Shadow Forest (Mercury)',
  [SpaceName.FLYING_GARDEN]: 'Flying Garden',
};

type TrackBonus = {percent: number, label: string, title: string};
type Track = {
  id: string,
  title: string,
  iconClass: string,
  percent: number,
  text: string,
  done: boolean,
  bonuses: Array<TrackBonus>,
};

function percentOf(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
}

export default defineComponent({
  name: 'GigaMarsBoard',
  emits: ['toggleTileView'],
  components: {
    BoardSpace,
  },
  props: {
    spaces: {
      type: Array as () => ReadonlyArray<SpaceModel>,
      required: true,
    },
    venusScaleLevel: {
      type: Number,
      required: true,
    },
    oceans_count: {
      type: Number,
      default: 0,
    },
    oxygen_level: {
      type: Number,
      default: 0,
    },
    temperature: {
      type: Number,
      default: constants.MIN_TEMPERATURE,
    },
    expansions: {
      type: Object as () => Record<Expansion, boolean>,
      required: true,
    },
    tileView: {
      type: String as () => TileView,
      default: 'show',
    },
  },
  methods: {
    positionStyle(space: SpaceModel): Record<string, string> {
      const position = POSITIONS.get(space.id);
      if (position === undefined) {
        return {};
      }
      return {margin: `${position.top}px 0 0 ${position.left}px`};
    },
    spaceName(space: SpaceModel): string {
      return OFF_MARS_NAMES[space.id] ?? '';
    },
  },
  computed: {
    marsSpaces(): Array<SpaceModel> {
      return this.spaces
        .filter((s) => s.spaceType !== SpaceType.COLONY)
        .toSorted((a, b) => parseInt(a.id) - parseInt(b.id));
    },
    offMarsSpaces(): Array<SpaceModel> {
      return this.spaces.filter((s) => s.spaceType === SpaceType.COLONY);
    },
    tracks(): Array<Track> {
      const max = getGlobalParameterMaximums(BoardName.GIGA);
      const minT = constants.MIN_TEMPERATURE;
      const tracks: Array<Track> = [
        {
          id: 'temperature',
          title: 'Temperature',
          iconClass: 'temperature-tile',
          percent: percentOf(this.temperature, minT, max.temperature),
          text: `${this.temperature > 0 ? '+' : ''}${this.temperature} °C`,
          done: this.temperature >= max.temperature,
          bonuses: [
            {percent: percentOf(constants.TEMPERATURE_BONUS_FOR_HEAT_1, minT, max.temperature), label: '♨', title: 'Heat production'},
            {percent: percentOf(constants.TEMPERATURE_BONUS_FOR_HEAT_2, minT, max.temperature), label: '♨', title: 'Heat production'},
            {percent: percentOf(constants.TEMPERATURE_FOR_OCEAN_BONUS, minT, max.temperature), label: '💧', title: 'Ocean'},
          ],
        },
        {
          id: 'oxygen',
          title: 'Oxygen Level',
          iconClass: 'oxygen-tile',
          percent: percentOf(this.oxygen_level, constants.MIN_OXYGEN_LEVEL, max.oxygen),
          text: `${this.oxygen_level} %`,
          done: this.oxygen_level >= max.oxygen,
          bonuses: [
            {percent: percentOf(constants.OXYGEN_LEVEL_FOR_TEMPERATURE_BONUS, constants.MIN_OXYGEN_LEVEL, max.oxygen), label: '🌡', title: 'Temperature'},
          ],
        },
        {
          id: 'oceans',
          title: 'Oceans',
          iconClass: 'ocean-tile',
          percent: percentOf(this.oceans_count, 0, max.oceans),
          text: `${this.oceans_count}/${max.oceans}`,
          done: this.oceans_count >= max.oceans,
          bonuses: [],
        },
      ];
      if (this.expansions.venus) {
        tracks.push({
          id: 'venus',
          title: 'Venus Scale',
          iconClass: 'venus-tile',
          percent: percentOf(this.venusScaleLevel, constants.MIN_VENUS_SCALE, max.venus),
          text: `${this.venusScaleLevel} %`,
          done: this.venusScaleLevel >= max.venus,
          bonuses: [
            {percent: percentOf(constants.VENUS_LEVEL_FOR_CARD_BONUS, 0, max.venus), label: '🂠', title: 'Card'},
            {percent: percentOf(constants.VENUS_LEVEL_FOR_TR_BONUS, 0, max.venus), label: 'TR', title: 'TR'},
            {percent: percentOf(constants.VENUS_LEVEL_FOR_GIGA_COLONY_BONUS, 0, max.venus), label: '◒', title: 'Colony'},
          ],
        });
      }
      return tracks;
    },
  },
});
</script>
