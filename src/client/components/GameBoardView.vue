<!-- Common widgets between player and spectator views -->
<template>
  <!--
    Top to bottom: milestones and awards, the Delta Project, Mars (with the contamination track at its side)
    and the other planets next to it (Venus, the Moon, Mercury and its Acts), Turmoil, the planetary tracks
    and the individual global parameter tracks. Colonies come after this component, in the home views.
  -->
  <div class="game-board-view">
    <div v-if="players.length > 1" class="player_home_block--milestones-and-awards" id="shortkey-milestones-awards">
      <a class="hotkey-target"></a>
      <Milestones :milestones="game.milestones" :boardName="game.gameOptions.boardName" />
      <Awards :awards="game.awards" :boardName="game.gameOptions.boardName" />
    </div>

    <DeltaProjectBoard v-if="game.gameOptions.expansions.deltaProject" :players="players" id="shortkey-deltaProject" />

    <div class="boards-row">
      <div class="boards-row__mars">
        <a name="board" class="player_home_anchor hotkey-target"></a>
        <Board
          :spaces="game.spaces"
          :expansions="game.gameOptions.expansions"
          :venusScaleLevel="game.venusScaleLevel"
          :boardName="game.gameOptions.boardName"
          :oceans_count="game.oceans"
          :oxygen_level="game.oxygenLevel"
          :temperature="game.temperature"
          :altVenusBoard="game.gameOptions.altVenusBoard"
          :venusPhase2Track="game.gameOptions.expansions.venusphase2 && game.gameOptions.expansions.venus"
          :hideVenusTrack="game.venusMap !== undefined"
          :aresData="game.aresData"
          :tileView="tileView"
          @toggleTileView="$emit('toggleTileView')"
          id="shortkey-board"
        />
        <ContaminationTrack v-if="game.contamination !== undefined" :level="game.contamination" :alt="game.gameOptions.altContaminationTrack" />
      </div>

      <div v-if="hasPlanets" class="boards-row__planets" data-test="planets">
        <template v-if="game.venusMap">
          <a class="hotkey-target"></a>
          <VenusMapBoard :model="game.venusMap" :tileView="tileView" :venusScaleLevel="game.venusScaleLevel" :boardName="game.gameOptions.boardName" :venusPhase2Track="game.gameOptions.expansions.venusphase2 && game.gameOptions.expansions.venus" :altVenusBoard="game.gameOptions.altVenusBoard" id="shortkey-venusMapBoard" />
        </template>
        <template v-if="game.moon">
          <a class="hotkey-target"></a>
          <MoonBoard :model="game.moon" :tileView="tileView" id="shortkey-moonBoard" />
        </template>
        <template v-if="game.mercury !== undefined">
          <MercuryBoard :model="game.mercury" :spaces="game.spaces" id="shortkey-mercury" />
          <MercuryActs :model="game.mercury" :players="players" id="shortkey-acts" />
        </template>
      </div>
    </div>

    <!-- Turmoil and the planetary tracks: side by side when the window is wide enough, else one under the other. -->
    <div class="boards-row boards-row--lower">
      <template v-if="game.turmoil">
        <a class="hotkey-target"></a>
        <div class="game-board-view__turmoil" id="shortkey-turmoil">
          <Turmoil :turmoil="game.turmoil" />
        </div>
      </template>

      <template v-if="game.gameOptions.expansions.pathfinders">
        <a class="hotkey-target"></a>
        <PlanetaryTracks :tracks="game.pathfinders" :gameOptions="game.gameOptions" id="shortkey-planetaryTracks" />
      </template>
    </div>

    <IndividualTracksBoard v-if="game.gameOptions.individualTracks" :players="players" id="shortkey-individualTracks" />
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

import {GameModel} from '@/common/models/GameModel';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import {SpaceId} from '@/common/Types';
import Board from '@/client/components/Board.vue';
import DeltaProjectBoard from '@/client/components/delta/DeltaProjectBoard.vue';
import IndividualTracksBoard from '@/client/components/individualTracks/IndividualTracksBoard.vue';
import MercuryBoard from '@/client/components/mercury/MercuryBoard.vue';
import MercuryActs from '@/client/components/mercury/MercuryActs.vue';
import ContaminationTrack from '@/client/components/nuclear/ContaminationTrack.vue';
import Milestones from '@/client/components/Milestones.vue';
import Awards from '@/client/components/Awards.vue';
import Turmoil from '@/client/components/turmoil/Turmoil.vue';
import MoonBoard from '@/client/components/moon/MoonBoard.vue';
import VenusMapBoard from '@/client/components/venus2/VenusMapBoard.vue';
import PlanetaryTracks from '@/client/components/pathfinders/PlanetaryTracks.vue';
import {TileView} from './board/TileView';
import {scrollToSpace} from '@/client/utils/boardScroll';

export default defineComponent({
  name: 'GameBoardView',
  props: {
    game: {
      type: Object as () => GameModel,
      required: true,
    },
    tileView: {
      type: String as () => TileView,
      required: true,
    },
    players: {
      type: Array as PropType<ReadonlyArray<PublicPlayerModel>>,
      required: true,
    },
  },
  emits: ['toggleTileView'],
  computed: {
    hasPlanets(): boolean {
      return this.game.venusMap !== undefined || this.game.moon !== undefined || this.game.mercury !== undefined;
    },
  },
  components: {
    Board,
    ContaminationTrack,
    DeltaProjectBoard,
    IndividualTracksBoard,
    MercuryBoard,
    MercuryActs,
    Milestones,
    Awards,
    Turmoil,
    MoonBoard,
    VenusMapBoard,
    PlanetaryTracks,
  },
  methods: {
    highlightSpace(spaceId: SpaceId) {
      scrollToSpace(spaceId);

      const regions = ['main_board', 'moon_board', 'moon_board_outer_spaces', 'venus_map_board'];
      for (const region of regions) {
        const board = document.getElementById(region);
        if (board !== null) {
          const array = board.getElementsByClassName('board-log-highlight');
          for (let i = 0, length = array.length; i < length; i++) {
            const element = array[i] as HTMLElement;
            if (element.getAttribute('data_log_highlight_id') === spaceId) {
              element.classList.add('highlight');
              setTimeout(() => {
                element.classList.remove('highlight');
              }, 3000);
              return;
            }
          }
        }
      }
    },
  },
});
</script>
