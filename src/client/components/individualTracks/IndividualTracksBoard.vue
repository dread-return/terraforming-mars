<!-- Individual global parameter tracks (Epic): where each player's marker is on the oxygen, temperature, oceans and cities tracks. -->
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
      <div class="individual-track__label">
        <IndividualTrackIcon :kind="track.symbol" />
        <span class="individual-track__name" v-i18n>{{ track.title }}</span>
      </div>
      <div class="individual-track__cells">
        <div
          v-for="cell in track.cells"
          :key="cell.step"
          class="individual-track__cell"
          :class="{'individual-track__cell--start': cell.step === 0}"
        >
          <div class="individual-track__pin-zone">
            <div v-if="cell.reward !== undefined" class="individual-track__pin" :title="rewardTitle(cell.reward)" :data-reward="cell.reward">
              <IndividualTrackIcon :kind="cell.reward" />
            </div>
          </div>
          <div class="individual-track__strip">{{ cell.step === 0 ? '' : cell.step }}</div>
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
        <div class="individual-track__cell individual-track__cell--end">
          <div class="individual-track__pin-zone">
            <div class="individual-track__pin" :title="leaderTitle(track)">
              <IndividualTrackIcon :kind="track.leaderKind" :count="track.leaderCount" />
            </div>
          </div>
          <div class="individual-track__strip individual-track__strip--end">
            <span class="individual-track__vp">{{ leaderVictoryPoints }}</span>
          </div>
          <div class="individual-track__markers individual-track__markers--end" v-i18n>VP</div>
        </div>
      </div>
    </div>
    <div v-if="extraClaims.length > 0" class="individual-tracks__claims" data-test="extra-claims">
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
} from '@/common/individualTracks/IndividualTracks';
import {getPreferences} from '@/client/utils/PreferencesManager';
import IndividualTrackIcon, {IndividualTrackIconKind} from '@/client/components/individualTracks/IndividualTrackIcon.vue';
import {range} from '@/common/utils/utils';

type Cell = {
  step: number,
  reward: IndividualTrackReward | undefined,
};

type TrackView = {
  name: IndividualTrackName,
  title: string,
  symbol: IndividualTrackIconKind,
  cells: ReadonlyArray<Cell>,
  leaderKind: IndividualTrackIconKind,
  leaderCount: number,
};

const TITLES: Record<IndividualTrackName, string> = {
  oxygen: 'Oxygen',
  temperature: 'Temperature',
  oceans: 'Oceans',
  cities: 'Cities',
};

const SYMBOLS: Record<IndividualTrackName, IndividualTrackIconKind> = {
  oxygen: 'oxygen',
  temperature: 'temperature',
  oceans: 'ocean',
  cities: 'cities',
};

const LEADER_ICONS = {
  plants: 'plant',
  heat: 'heat',
  steel: 'steel',
  megacredits: 'megacredits',
} as const;

const LEADER_ICONS_TEXT: Record<IndividualTrackName, string> = {
  oxygen: 'plant',
  temperature: 'heat',
  oceans: 'M€',
  cities: 'steel',
};

const REWARD_TITLES: Record<IndividualTrackReward, string> = {
  postlude: 'Postlude card (not in the game yet)',
  plantProduction: 'Increase your plant production 1 step',
  heatProduction: 'Increase your heat production 1 step',
  steelProduction: 'Increase your steel production 1 step',
  ocean: 'Place an ocean tile',
  milestoneAward: 'Claim an extra milestone or fund an extra award, even if all the regular ones are taken',
};

const TRACKS: ReadonlyArray<TrackView> = INDIVIDUAL_TRACK_NAMES.map((name) => {
  const spec = INDIVIDUAL_TRACKS[name];
  return {
    name: name,
    title: TITLES[name],
    symbol: SYMBOLS[name],
    cells: range(spec.length + 1).map((step) => ({
      step: step,
      reward: spec.rewards.find((r) => r.step === step)?.reward,
    })),
    leaderKind: LEADER_ICONS[spec.leaderReward.resource],
    leaderCount: spec.leaderReward.count,
  };
});

export default defineComponent({
  name: 'IndividualTracksBoard',
  components: {IndividualTrackIcon},
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
    rewardTitle(reward: IndividualTrackReward): string {
      return REWARD_TITLES[reward];
    },
    leaderTitle(track: TrackView): string {
      return `Leader of this track gets ${track.leaderCount} ${LEADER_ICONS_TEXT[track.name]} each production phase and ${LEADER_VICTORY_POINTS} VP at the end of the game`;
    },
  },
});
</script>

<style scoped lang="less">
@cell: 46px;

.individual-tracks {
  margin: 20px;
  padding: 10px 12px 12px;
  display: block;
  overflow-x: auto;
  background: #303030;
  border-radius: 4px;
  color: #e8e8e8;
}

.individual-tracks__title {
  font-family: Prototype, sans-serif;
  font-size: 18px;
  margin-bottom: 8px;
}

.individual-tracks__claims {
  margin-top: 6px;
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
  margin-top: 8px;
  font-size: 12px;
  color: #b8b8b8;
  max-width: 900px;
}

.individual-track {
  display: flex;
  align-items: flex-end;
  margin-bottom: 4px;
  min-width: max-content;
}

.individual-track__label {
  width: 140px;
  min-width: 140px;
  padding-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.individual-track__name {
  font-family: Prototype, sans-serif;
  font-size: 16px;
}

.individual-track__cells {
  display: flex;
  align-items: flex-end;
}

.individual-track__cell {
  width: @cell;
  min-width: @cell;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.individual-track__pin-zone {
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

// A reward pin: an icon on a small plate with a pointer to its step.
.individual-track__pin {
  position: relative;
  padding: 2px;
  margin-bottom: 7px;
  background: linear-gradient(#f2f2f2, #b4b4b4);
  border: 1px solid #555;
  border-radius: 3px;
  line-height: 0;
}

.individual-track__pin::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -7px;
  margin-left: -5px;
  border: 5px solid transparent;
  border-top: 6px solid #b4b4b4;
  border-bottom: 0;
}

.individual-track__pin :deep(svg) {
  width: 26px;
  height: 26px;
}

.individual-track__strip {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Prototype, sans-serif;
  font-size: 17px;
  border-left: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.25);
}

.individual-track__cell--start .individual-track__strip {
  border-left: none;
  border-radius: 14px 0 0 14px;
  min-width: 30px;
}

.individual-track__cell--end .individual-track__strip {
  border-radius: 0 14px 14px 0;
}

.individual-track[class] .individual-track__strip.individual-track__strip--end {
  background: linear-gradient(#e6b730, #9a6f08);
  color: #2a1d00;
}

.individual-track__vp {
  font-size: 20px;
  text-shadow: 0 0 2px #ffe48a;
}

.individual-track__markers {
  min-height: 25px;
  padding-top: 3px;
  display: flex;
  flex-wrap: wrap;
  place-content: flex-start center;
  gap: 2px;
  font-family: Prototype, sans-serif;
  font-size: 11px;
  color: #b8b8b8;
}

.individual-track__markers--end {
  justify-content: center;
}

.individual-track__cube {
  position: relative;
  width: 21px;
  height: 21px;
  margin: 0;
  filter: drop-shadow(2px 2px 3px black);
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

// Each track's strip takes the colour it has on the board.
.individual-track--oxygen .individual-track__strip {
  background: linear-gradient(#f4f4f1, #cfcfc8);
  color: #1b1b1b;
}

.individual-track--temperature .individual-track__strip {
  background: linear-gradient(#f08a3c, #c2401d);
  color: #fff;
}

.individual-track--oceans .individual-track__strip {
  background: linear-gradient(#3a8fd6, #1d4f9a);
  color: #fff;
}

.individual-track--cities .individual-track__strip {
  background: linear-gradient(#aab0b4, #6f777c);
  color: #1b1b1b;
}
</style>
