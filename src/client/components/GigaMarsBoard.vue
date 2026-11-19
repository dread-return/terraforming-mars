<!--
  The fan GIGA expansion's board: its Mars map (175 spaces over a picture of Mars), its global
  parameter tracks, drawn around the planet like the dial of the other maps, and the off-Mars spaces.
-->
<template>
  <div class="board-cont board-cont--giga">
    <div class="hide-tile-button-container">
      <div class="hide-tile-button" @click="$emit('toggleTileView')" data-test="hide-tiles-button" v-i18n>
        {{ tileView }} tiles
      </div>
    </div>

    <div class="board board--giga" :class="{'board--giga-venus': expansions.venus}" id="main_board">
      <div class="global-numbers giga-dial">
        <div v-for="track in dialTracks" :key="track.name" :class="'giga-dial-' + track.name" :data-test="'giga-track-' + track.name">
          <div v-for="cell in track.cells" :key="cell.value" :class="cell.css" :style="cell.style">{{ cell.label }}</div>
        </div>

        <template v-for="bonus in dialBonuses" :key="bonus.key">
          <div class="giga-dial-pointer" :style="bonus.pointerStyle"></div>
          <div class="giga-dial-bonus" :class="'giga-dial-bonus--' + bonus.icon" :style="bonus.iconStyle" :title="$t(bonus.title)"></div>
        </template>

        <template v-if="expansions.venus">
          <div class="giga-dial-cap giga-dial-cap--venus" :style="venusCaps.start"></div>
          <div class="giga-dial-cap giga-dial-cap--percent" :style="venusCaps.end">%</div>
        </template>
        <div class="giga-dial-label" :style="labels.oxygen">O<sub>2</sub></div>
        <div class="giga-dial-label" :style="labels.temperature">t<sup>o</sup>C</div>

        <div class="global-numbers-oceans giga-dial-oceans" :style="oceansStyle" data-test="giga-oceans">
          <div class="giga-dial-ocean-icon"></div>
          <img v-if="oceans_count === maximums.oceans" width="26" src="assets/misc/circle-checkmark.png" class="board-ocean-checkmark" :alt="$t('Completed!')">
          <span v-else>{{ oceans_count }}/{{ maximums.oceans }}</span>
        </div>
      </div>

      <BoardSpace
        v-for="space in marsSpaces"
        :key="space.id"
        :space="space"
        :class="{'giga-polar': isPolar(space)}"
        :style="positionStyle(space)"
        :aresExtension="expansions.ares"
        :nuclearExpansion="expansions.nuclear"
        :tileView="tileView"
        data-test="board-space"
      />

      <!-- Inside #main_board, which SelectSpace already searches, so no #colony_spaces id here. -->
      <div class="giga-off-mars-spaces">
        <BoardSpace
          v-for="space in placedOffMarsSpaces"
          :key="space.id"
          :space="space"
          :text="spaceName(space)"
          class="giga-off-mars"
          :style="offMarsStyle(space)"
          :tileView="tileView"
          data-test="off-mars-space"
        />
      </div>
    </div>

    <div v-if="otherOffMarsSpaces.length > 0" class="giga-outer-spaces" id="colony_spaces">
      <div v-for="space in otherOffMarsSpaces" :key="space.id" class="giga-outer-space">
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
import {GIGA_POLAR_SPACES, GIGA_SPACES} from '@/common/boards/gigaMap';
import {DIAL_TRACK_EXTENTS, DIAL_TRACK_WIDTH, DialTrackName, GIGA_MARS_LEFT, GIGA_MARS_TOP, dialCell, dialCells, dialPoint} from '@/client/components/board/gigaDial';

// Where the spaces sit on the board: the center of the first hex of the top row, and the distance
// between neighbouring hexes and rows. They match the planet on assets/board/giga-mars.jpg.
const FIRST_HEX_X = GIGA_MARS_LEFT + 256.3;
const FIRST_HEX_Y = GIGA_MARS_TOP + 80.8;
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
  [SpaceName.SPACE_SOLARIUM]: 'Space Solarium',
};

// Where the off-Mars spaces sit, in the corners around the planet, grouped like on the round maps:
// Ganymede, Phobos and the other early ones top left, the Venus cities top right near the Venus
// track, Pathfinders bottom right, Mercury and the off-world greeneries bottom left.
const OFF_MARS_SLOTS: Partial<Record<SpaceId, {left: number, top: number}>> = {
  [SpaceName.GANYMEDE_COLONY]: {left: 20, top: 28},
  [SpaceName.PHOBOS_SPACE_HAVEN]: {left: 110, top: 28},
  [SpaceName.STANFORD_TORUS]: {left: 200, top: 28},
  [SpaceName.SIDERALIS]: {left: 290, top: 28},
  [SpaceName.MAIN_DOCKING_STATION]: {left: 20, top: 128},
  [SpaceName.LUNA_METROPOLIS]: {left: 1096, top: 28},
  [SpaceName.DAWN_CITY]: {left: 1006, top: 28},
  [SpaceName.STRATOPOLIS]: {left: 916, top: 28},
  [SpaceName.VENERA_BASE]: {left: 826, top: 28},
  [SpaceName.MAXWELL_BASE]: {left: 1096, top: 128},
  [SpaceName.FLYING_GARDEN]: {left: 20, top: 530},
  [SpaceName.NEW_POMPEII]: {left: 20, top: 646},
  [SpaceName.SHADOW_FOREST]: {left: 110, top: 646},
  [SpaceName.SPACE_SOLARIUM]: {left: 200, top: 646},
  [SpaceName.CERES_SPACEPORT]: {left: 1096, top: 530},
  [SpaceName.DYSON_SCREENS]: {left: 1096, top: 646},
  [SpaceName.LUNAR_EMBASSY]: {left: 1006, top: 646},
};

type DialBonus = {
  track: DialTrackName,
  value: number,
  icon: 'heat-production' | 'ocean' | 'temperature' | 'card' | 'tr' | 'colony',
  title: string,
};

// The bonuses printed next to the tracks.
const BONUSES: ReadonlyArray<DialBonus> = [
  {track: 'temperature', value: constants.TEMPERATURE_BONUS_FOR_HEAT_1, icon: 'heat-production', title: 'Heat production'},
  {track: 'temperature', value: constants.TEMPERATURE_BONUS_FOR_HEAT_2, icon: 'heat-production', title: 'Heat production'},
  {track: 'temperature', value: constants.TEMPERATURE_FOR_OCEAN_BONUS, icon: 'ocean', title: 'Ocean'},
  {track: 'oxygen', value: constants.OXYGEN_LEVEL_FOR_TEMPERATURE_BONUS, icon: 'temperature', title: 'Temperature'},
  {track: 'venus', value: constants.VENUS_LEVEL_FOR_CARD_BONUS, icon: 'card', title: 'Card'},
  {track: 'venus', value: constants.VENUS_LEVEL_FOR_TR_BONUS, icon: 'tr', title: 'TR'},
  {track: 'venus', value: constants.VENUS_LEVEL_FOR_GIGA_COLONY_BONUS, icon: 'colony', title: 'Colony'},
];

/** Centers an element on (x, y), turned by `rotation` degrees. */
function placeAt(x: number, y: number, rotation: number = 0): Record<string, string> {
  return {
    left: `${x.toFixed(1)}px`,
    top: `${y.toFixed(1)}px`,
    transform: `translate(-50%, -50%) rotate(${rotation.toFixed(1)}deg)`,
  };
}

function label(track: DialTrackName, value: number): string {
  return track === 'temperature' && value > 0 ? `+${value}` : String(value);
}

type DialTrackView = {
  name: DialTrackName,
  cells: Array<{value: number, label: string, css: Array<string>, style: Record<string, string>}>,
};

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
    isPolar(space: SpaceModel): boolean {
      return GIGA_POLAR_SPACES.includes(space.id);
    },
    offMarsStyle(space: SpaceModel): Record<string, string> {
      const slot = OFF_MARS_SLOTS[space.id];
      return slot === undefined ? {} : {margin: `${slot.top}px 0 0 ${slot.left}px`};
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
    placedOffMarsSpaces(): Array<SpaceModel> {
      return this.spaces.filter((s) => s.spaceType === SpaceType.COLONY && OFF_MARS_SLOTS[s.id] !== undefined);
    },
    // Any off-Mars space without a spot of its own goes in a row under the board.
    otherOffMarsSpaces(): Array<SpaceModel> {
      return this.spaces.filter((s) => s.spaceType === SpaceType.COLONY && OFF_MARS_SLOTS[s.id] === undefined);
    },
    maximums() {
      return getGlobalParameterMaximums(BoardName.GIGA);
    },
    dialTracks(): Array<DialTrackView> {
      const current: Record<DialTrackName, number> = {
        oxygen: this.oxygen_level,
        temperature: this.temperature,
        venus: this.venusScaleLevel,
      };
      const names: Array<DialTrackName> = this.expansions.venus ? ['oxygen', 'venus', 'temperature'] : ['oxygen', 'temperature'];
      return names.map((name) => ({
        name,
        cells: dialCells(name).map((cell) => {
          const css = ['global-numbers-value', 'giga-dial-value'];
          if (!Number.isInteger(cell.value)) {
            css.push('giga-dial-value--half');
          }
          if (cell.value === current[name]) {
            css.push('val-is-active');
          }
          return {value: cell.value, label: label(name, cell.value), css, style: placeAt(cell.x, cell.y, cell.rotation)};
        }),
      }));
    },
    dialBonuses() {
      return BONUSES
        .filter((bonus) => bonus.track !== 'venus' || this.expansions.venus)
        .map((bonus) => {
          const cell = dialCell(bonus.track, bonus.value);
          const s = (cell.start + cell.end) / 2;
          const pointer = dialPoint(s, DIAL_TRACK_WIDTH / 2 + 8);
          const icon = dialPoint(s, DIAL_TRACK_WIDTH / 2 + 30);
          return {
            key: `${bonus.track}-${bonus.value}`,
            icon: bonus.icon,
            title: bonus.title,
            // The pointer points at the track.
            pointerStyle: placeAt(pointer.x, pointer.y, pointer.normal),
            iconStyle: placeAt(icon.x, icon.y),
          };
        });
    },
    venusCaps(): {start: Record<string, string>, end: Record<string, string>} {
      const {start, end} = DIAL_TRACK_EXTENTS.venus;
      const first = dialPoint(start - 19, 4);
      const last = dialPoint(end + 19, 4);
      return {
        start: placeAt(first.x, first.y, first.normal + 90),
        end: placeAt(last.x, last.y, last.normal + 90),
      };
    },
    labels(): Record<'oxygen' | 'temperature', Record<string, string>> {
      // Just past the start of each track, outside the dial, as on the standard one.
      const oxygen = dialPoint(DIAL_TRACK_EXTENTS.oxygen.start - 12, 34);
      const temperature = dialPoint(DIAL_TRACK_EXTENTS.temperature.end + 16, 34);
      return {
        oxygen: placeAt(oxygen.x, oxygen.y),
        temperature: placeAt(temperature.x, temperature.y),
      };
    },
    oceansStyle(): Record<string, string> {
      const bottom = dialPoint(0);
      return placeAt(bottom.x, bottom.y);
    },
  },
});
</script>
