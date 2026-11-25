<!--
  Individual global parameter tracks (Epic): where each player's marker is on the oxygen, temperature, oceans and
  cities tracks. Drawn in the style of the Pathfinders planetary tracks: one dark row per track with its symbol
  on a round badge at the left, the reward spots drawn with the game's own icons, the step numbers on a band in the
  track's colour (the temperature band runs from cold blue to hot red, like the board's thermometer), the player
  cubes under their step, and at the end what the leader gets: a resource each production phase and 3 VP.
-->
<template>
  <div class="individual-tracks" data-test="individual-tracks">
    <div class="individual-tracks__title" v-i18n>Individual global parameter tracks</div>
    <div
      v-for="track in tracks"
      :key="track.name"
      class="individual-track"
      :class="'individual-track--' + track.name"
      :data-test="'individual-track-' + track.name"
    >
      <div class="individual-track__badge" :title="$t(track.title)">
        <div class="individual-track__symbol" :class="'individual-track__symbol--' + track.name"></div>
        <div class="individual-track__name" v-i18n>{{ track.title }}</div>
      </div>
      <div class="individual-track__cells">
        <div
          v-for="cell in track.cells"
          :key="cell.step"
          class="individual-track__cell"
          :class="{'individual-track__cell--start': cell.step === 0, 'individual-track__cell--reward': cell.reward !== undefined}"
        >
          <div class="individual-track__reward">
            <div v-if="cell.reward !== undefined" :title="$t(rewardTitle(cell.reward))" :data-reward="cell.reward" class="individual-track__reward-icon">
              <div v-if="isProduction(cell.reward)" class="individual-track__production">
                <div :class="productionIcon(cell.reward)"></div>
              </div>
              <div v-else :class="'individual-track__icon individual-track__icon--' + cell.reward"></div>
            </div>
          </div>
          <div class="individual-track__number" :style="numberStyle(track, cell.step)">{{ cell.step === 0 ? '' : cell.step }}</div>
          <div class="individual-track__markers">
            <i
              v-for="color in playersAt(track.name, cell.step)"
              :key="color"
              :class="cubeCss(color)"
              class="individual-track__cube"
              :data-test="'marker-' + color"
            ></i>
          </div>
        </div>
        <div class="individual-track__cell individual-track__cell--end" :title="leaderTitle(track)">
          <div class="individual-track__reward">
            <div class="individual-track__leader-resource" :class="'individual-track__leader-resource--' + track.leaderResource">
              <span v-if="track.leaderResource === 'megacredits'">{{ track.leaderCount }}</span>
            </div>
          </div>
          <div class="individual-track__number individual-track__number--end">
            <span class="individual-track__vp">{{ leaderVictoryPoints }}</span>
            <span class="individual-track__vp-label">VP</span>
          </div>
          <div class="individual-track__markers">
            <div class="individual-track__crown"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="extraClaims.length > 0" class="individual-tracks__claims" data-test="extra-claims">
      <div class="individual-track__icon individual-track__icon--milestoneAward individual-track__icon--small"></div>
      <span v-i18n>Extra milestone or award:</span>
      <span v-for="claim in extraClaims" :key="claim.color" class="individual-tracks__claim">
        <i :class="cubeCss(claim.color)" class="individual-track__cube"></i> × {{ claim.count }}
      </span>
    </div>
    <div class="individual-tracks__help" v-i18n>
      Move your marker 1 step each time you raise the parameter, and for cities each time you place a city or play a card with a city tag (once if the same action or card does both). Reach a spot to claim its reward. In each production phase the leader of a track (or leaders, on a tie) gets the resource shown at its end, and at the end of the game 3 VP.
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {Color} from '@/common/Color';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import {
  INDIVIDUAL_TRACK_NAMES,
  INDIVIDUAL_TRACKS,
  IndividualTrackName,
  IndividualTrackReward,
  LEADER_VICTORY_POINTS,
  LeaderReward,
} from '@/common/individualTracks/IndividualTracks';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {range} from '@/common/utils/utils';

type Cell = {
  step: number,
  reward: IndividualTrackReward | undefined,
};

type TrackView = {
  name: IndividualTrackName,
  title: string,
  length: number,
  cells: ReadonlyArray<Cell>,
  leaderResource: LeaderReward['resource'],
  leaderCount: number,
};

const TITLES: Record<IndividualTrackName, string> = {
  oxygen: 'Oxygen',
  temperature: 'Temperature',
  oceans: 'Oceans',
  cities: 'Cities',
};

const LEADER_TEXT: Record<LeaderReward['resource'], string> = {
  plants: 'plant',
  heat: 'heat',
  steel: 'steel',
  megacredits: 'M€',
};

const REWARD_TITLES: Record<IndividualTrackReward, string> = {
  postlude: 'Postlude: draw 4 postludes and keep 1 (only with the Postludes module)',
  plantProduction: 'Increase your plant production 1 step',
  heatProduction: 'Increase your heat production 1 step',
  steelProduction: 'Increase your steel production 1 step',
  ocean: 'Place an ocean tile',
  milestoneAward: 'Claim an extra milestone or fund an extra award, even if all the regular ones are taken',
};

const PRODUCTION_ICONS: Partial<Record<IndividualTrackReward, string>> = {
  plantProduction: 'plants',
  heatProduction: 'heat',
  steelProduction: 'steel',
};

// The temperature band, cold to hot (the colours of the thermometer on the board).
const COLD = [59, 108, 186];
const HOT = [214, 66, 38];

const TRACKS: ReadonlyArray<TrackView> = INDIVIDUAL_TRACK_NAMES.map((name) => {
  const spec = INDIVIDUAL_TRACKS[name];
  return {
    name: name,
    title: TITLES[name],
    length: spec.length,
    cells: range(spec.length + 1).map((step) => ({
      step: step,
      reward: spec.rewards.find((r) => r.step === step)?.reward,
    })),
    leaderResource: spec.leaderReward.resource,
    leaderCount: spec.leaderReward.count,
  };
});

export default defineComponent({
  name: 'IndividualTracksBoard',
  props: {
    players: {
      type: Array as PropType<ReadonlyArray<PublicPlayerModel>>,
      required: true,
    },
  },
  data() {
    return {
      tracks: TRACKS,
      leaderVictoryPoints: LEADER_VICTORY_POINTS,
    };
  },
  computed: {
    extraClaims(): Array<{color: Color, count: number}> {
      const result: Array<{color: Color, count: number}> = [];
      for (const player of this.players) {
        const count = player.individualTracks?.extraClaims ?? 0;
        if (count > 0) {
          result.push({color: player.color, count: count});
        }
      }
      return result;
    },
  },
  methods: {
    cubeCss(color: Color): string {
      const css = 'board-cube board-cube--' + color;
      return getPreferences().symbol_overlay ? css + ' overlay' : css;
    },
    playersAt(track: IndividualTrackName, step: number): Array<Color> {
      const result: Array<Color> = [];
      for (const player of this.players) {
        if (player.individualTracks?.positions[track] === step) {
          result.push(player.color);
        }
      }
      return result;
    },
    isProduction(reward: IndividualTrackReward): boolean {
      return PRODUCTION_ICONS[reward] !== undefined;
    },
    productionIcon(reward: IndividualTrackReward): string {
      return 'resource_icon resource_icon--' + PRODUCTION_ICONS[reward];
    },
    numberStyle(track: TrackView, step: number): Record<string, string> {
      if (track.name !== 'temperature' || step === 0) {
        return {};
      }
      const t = (step - 1) / Math.max(1, track.length - 1);
      const mix = (i: number, k: number) => Math.round(COLD[i] + (HOT[i] - COLD[i]) * t * k);
      const top = `rgb(${mix(0, 1)}, ${mix(1, 1)}, ${mix(2, 1)})`;
      const bottom = `rgb(${Math.round(mix(0, 1) * 0.7)}, ${Math.round(mix(1, 1) * 0.7)}, ${Math.round(mix(2, 1) * 0.7)})`;
      return {background: `linear-gradient(${top}, ${bottom})`};
    },
    rewardTitle(reward: IndividualTrackReward): string {
      return REWARD_TITLES[reward];
    },
    leaderTitle(track: TrackView): string {
      return `Leader of this track gets ${track.leaderCount} ${LEADER_TEXT[track.leaderResource]} each production phase and ${LEADER_VICTORY_POINTS} VP at the end of the game`;
    },
  },
});
</script>

<style scoped lang="less">
@cell: 48px;
@reward-height: 50px;
@number-height: 24px;
@markers-height: 28px;

.individual-tracks {
  margin: 20px;
  padding: 0 0 4px 44px;
  display: block;
  width: fit-content;
  box-sizing: border-box;
  max-width: calc(100% - 40px);
  overflow-x: auto;
  color: #e8e8e8;
}

.individual-tracks__title {
  font-family: Prototype, sans-serif;
  font-size: 18px;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 3px #000;
  margin: 0 0 10px -44px;
}

// A row, like a planetary track: a dark band, lighter on the left, with a round badge hanging off its left edge.
.individual-track {
  position: relative;
  display: flex;
  width: fit-content;
  padding-left: 46px;
  margin-bottom: 12px;
  border-radius: 2px;
  background: linear-gradient(to right, var(--track-tint) 0, #3a3a3a 140px, #2c2c2c);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.individual-track--oxygen { --track-tint: #5d7d63; }
.individual-track--temperature { --track-tint: #7a4b3a; }
.individual-track--oceans { --track-tint: #2f5d8c; }
.individual-track--cities { --track-tint: #67696c; }

.individual-track__badge {
  position: absolute;
  left: -30px;
  top: 50%;
  margin-top: -38px;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.individual-track__symbol {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #000;
  box-shadow: 0 0 0 2px #888, 0 2px 6px #000;
  background: radial-gradient(circle at 40% 35%, #4a4a4a, #151515) no-repeat;
}

.individual-track__symbol--oxygen {
  background: url(./assets/global-parameters/oxygen.png) center / 46px no-repeat, radial-gradient(circle at 40% 35%, #4a4a4a, #151515);
}

.individual-track__symbol--temperature {
  background: url(./assets/global-parameters/temperature.png) center / 40px no-repeat, radial-gradient(circle at 40% 35%, #4a4a4a, #151515);
}

.individual-track__symbol--oceans {
  background: url(./assets/tiles/ocean.png) center / 40px 46px no-repeat, radial-gradient(circle at 40% 35%, #4a4a4a, #151515);
}

.individual-track__symbol--cities {
  background: url(./assets/tiles/city.png) center / 40px 46px no-repeat, radial-gradient(circle at 40% 35%, #4a4a4a, #151515);
}

.individual-track__name {
  margin-top: 3px;
  padding: 0 5px;
  font-family: Prototype, sans-serif;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 3px;
}

.individual-track__cells {
  display: flex;
}

// Each step is a column with the same shading as a planetary-track cell.
.individual-track__cell {
  width: @cell;
  min-width: @cell;
  display: flex;
  flex-direction: column;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.53));
  border-left: 2px solid rgba(0, 0, 0, 0.53);
}

.individual-track__cell--start {
  width: 30px;
  min-width: 30px;
}

.individual-track__reward {
  height: @reward-height;
  display: flex;
  align-items: center;
  justify-content: center;
}

.individual-track__reward-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 1px 2px #000);
}

.individual-track__number {
  height: @number-height;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Prototype, sans-serif;
  font-size: 16px;
  color: #fff;
  text-shadow: 0 1px 2px #000;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 1px solid rgba(0, 0, 0, 0.6);
}

// The bands, in the colours of the board's tracks (temperature is set step by step from the script).
.individual-track--oxygen .individual-track__number {
  background: linear-gradient(#7fa585, #4e6e55);
}

.individual-track--temperature .individual-track__number {
  background: linear-gradient(#3b6cba, #294b82);
}

.individual-track--oceans .individual-track__number {
  background: linear-gradient(#2f79c2, #1d4f85);
}

.individual-track--cities .individual-track__number {
  background: linear-gradient(#8d9196, #5d6165);
}

.individual-track__cell--start .individual-track__number {
  background: rgba(0, 0, 0, 0.35);
}

// The cell where a reward is gets a lighter band, as the planetary tracks light up their spots.
.individual-track__cell--reward {
  background: linear-gradient(rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.53));
}

.individual-track__markers {
  height: @markers-height;
  padding-top: 3px;
  display: flex;
  flex-wrap: wrap;
  place-content: flex-start center;
  gap: 2px;
}

.individual-track__cube {
  position: relative;
  width: 20px;
  height: 20px;
  margin: 0;
  filter: drop-shadow(1px 2px 2px black);
}

.individual-track__cube::after {
  margin-left: 0 !important;
  margin-top: 0 !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Reward icons, from the game's own images.
.individual-track__icon {
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.individual-track__icon--postlude {
  width: 30px;
  height: 43px;
  background-image: url(./assets/individual-tracks/postlude-card.png);
  border-radius: 3px;
}

.individual-track__icon--ocean {
  width: 34px;
  height: 40px;
  background-image: url(./assets/tiles/ocean.png);
}

// The winged "!" of the printed board, on the award wings of the game's milestone and award art.
.individual-track__icon--milestoneAward {
  width: 62px;
  height: 22px;
  margin: 0 -9px;
  background-image: url(./assets/individual-tracks/extra-milestone-award.png);
}

.individual-track__icon--small {
  width: 46px;
  height: 16px;
  margin: 0;
}

// A production box, as on the cards.
.individual-track__production {
  padding: 3px;
  line-height: 0;
  border-top: 2px solid #ddd;
  border-left: 2px solid #ddd;
  border-bottom: 2px solid #898989;
  border-right: 2px solid #898989;
  background: url(./assets/misc/production.png) center / cover;

  .resource_icon {
    width: 28px;
    height: 28px;
  }
}

// The end of the track: what its leader gets.
.individual-track__cell--end {
  width: 56px;
  min-width: 56px;
  background: linear-gradient(rgba(255, 204, 100, 0.12), rgba(0, 0, 0, 0.53));
}

.individual-track__leader-resource {
  width: 34px;
  height: 34px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 1px 2px #000);
  font-family: Prototype, sans-serif;
  font-size: 18px;
  line-height: 34px;
  text-align: center;
  color: #000;
}

.individual-track__leader-resource--plants { background-image: url(./assets/resources/plant.png); }
.individual-track__leader-resource--heat { background-image: url(./assets/resources/heat.png); }
.individual-track__leader-resource--steel { background-image: url(./assets/resources/steel.png); }
.individual-track__leader-resource--megacredits { background-image: url(./assets/resources/megacredit.png); }

.individual-track__number--end {
  gap: 3px;
  background: linear-gradient(#cc8b00, #805700) !important;
  border-top-color: #ffd36a;
}

.individual-track__vp {
  font-size: 18px;
  text-shadow: 0 0 2px darkorange;
}

.individual-track__vp-label {
  font-size: 10px;
}

.individual-track__crown {
  width: 22px;
  height: 22px;
  background: url(./assets/pathfinders/crown_a.png) center / contain no-repeat;
  filter: drop-shadow(0 1px 2px #000);
}

.individual-tracks__claims {
  margin: 4px 0 0 -44px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.individual-tracks__claim {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.individual-tracks__help {
  margin: 6px 0 0 -44px;
  font-size: 12px;
  color: #b8b8b8;
  max-width: 900px;
  text-shadow: 0 0 2px #000;
}
</style>
