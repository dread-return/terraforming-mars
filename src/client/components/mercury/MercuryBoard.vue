<!--
  Mercury vs Mars: the Mercury board, at the size of the Moon and Venus maps. Mercury (NASA MESSENGER
  enhanced-colour map) carries Market Colonies' stock and the New Pompeii and Shadow Forest areas; the
  Mercury track curves around its right side, and Market Colonies' rules and the Act deck sit to its left.
  The Acts in development are drawn by MercuryActs.vue.
-->
<template>
  <div class="mercury-board" data-test="mercury-board">
    <div class="planet-label mercury-board__label" v-i18n>Mercury</div>
    <div id="mercury_board" class="mercury-board__map">
      <!-- Market Colonies: rules on the left, stock on the planet -->
      <div class="mercury-market__info" data-test="mercury-market">
        <div class="mercury-market__title"><span class="mercury-board__symbol">☿</span><span v-i18n>Market Colonies</span></div>
        <div class="mercury-market__rule">
          <span v-i18n>Colony bonus</span>
          <i class="mercury-icon mercury-icon--asset"></i>
        </div>
        <div class="mercury-market__rule">
          <span><span v-i18n>Trade income</span><small v-i18n>gathered resources, one type, max 3</small></span>
        </div>
        <div class="mercury-market__rule">
          <span><span v-i18n>Colony charge</span><small v-i18n>unused resources</small></span>
          <span class="mercury-market__charge"><i class="mercury-icon mercury-icon--wild"></i>:<i class="mercury-icon mercury-icon--asset"></i></span>
        </div>
      </div>

      <div class="mercury-deck" :title="$t('Act deck') + ': ' + model.actDeckSize">
        <div class="mercury-deck__pile">
          <div class="mercury-deck__card"></div>
          <div class="mercury-deck__card"></div>
          <div class="mercury-deck__card"></div>
          <span class="mercury-deck__count" data-test="act-deck-size">{{ model.actDeckSize }}</span>
        </div>
        <div class="mercury-deck__label"><span v-i18n>Act deck</span> · <span v-i18n>discard</span> {{ model.actDiscardSize }}</div>
      </div>

      <div class="mercury-board__planet" :title="$t('Mercury') + ' (NASA/JHUAPL/Carnegie Institution of Washington)'"></div>

      <div class="mercury-market__grid">
        <div v-for="column in marketColumns" :key="column" class="mercury-market__column" :data-test="'market-' + column" :title="marketLabel(column) + ': ' + model.market[column] + ' / ' + marketCap">
          <div class="mercury-market__head"><i class="mercury-icon" :class="'mercury-icon--' + column"></i></div>
          <div v-for="row in marketCap" :key="row" class="mercury-market__cell" :class="{'mercury-market__cell--full': row <= model.market[column]}">
            <i v-if="row <= model.market[column]" :class="marketResourceCss(column, row - 1)" data-test="market-resource"></i>
          </div>
        </div>
      </div>

      <!-- New Pompeii and Shadow Forest: board spaces, so tiles can be placed here. -->
      <div v-for="area in shownAreas" :key="area.space.id" class="mercury-area" :class="'mercury-area--' + area.kind">
        <BoardSpace :space="area.space" tileView="show" />
        <div class="mercury-area__name" v-i18n>{{ area.name }}</div>
      </div>

      <!-- Mercury track -->
      <div class="mercury-track" data-test="mercury-track">
        <svg class="mercury-track__arc" :viewBox="'0 0 ' + MAP_WIDTH + ' ' + MAP_HEIGHT" aria-hidden="true">
          <path :d="arcPath" class="mercury-track__rail" />
          <line v-for="tick in ticks" :key="tick.step" :x1="tick.x - tick.nx * 6" :y1="tick.y - tick.ny * 6" :x2="tick.x + tick.nx * 6" :y2="tick.y + tick.ny * 6" class="mercury-track__tick" />
        </svg>
        <div
          v-for="tick in ticks"
          :key="tick.step"
          class="mercury-track__cell"
          :class="{'mercury-track__cell--current': tick.step === model.track, 'mercury-track__cell--passed': tick.step < model.track, 'mercury-track__cell--prize': prize(tick.step) !== undefined}"
          :style="{left: tick.x + 'px', top: tick.y + 'px'}"
          :title="prizeTitle(tick.step)"
          :data-step="tick.step"
        >
          <span v-if="prize(tick.step) !== undefined" class="mercury-track__dot"></span>
          <span class="mercury-track__label">
            <span class="mercury-track__number">{{ tick.step }}</span>
            <span v-if="prize(tick.step) !== undefined" class="mercury-track__everyone">
              <i v-for="(reward, i) in prize(tick.step)?.everyone" :key="i" class="mercury-icon" :class="'mercury-icon--' + reward"></i>
              <span class="mercury-track__star">*</span>
            </span>
            <span v-if="(prize(tick.step)?.risingPlayer.length ?? 0) > 0" class="mercury-track__rising">
              <i v-for="(reward, i) in prize(tick.step)?.risingPlayer" :key="i" class="mercury-icon" :class="'mercury-icon--' + reward"></i>
              <span class="mercury-track__caret">^</span>
            </span>
          </span>
        </div>
        <div class="mercury-track__marker" :style="markerStyle" :title="$t('Mercury track') + ': ' + model.track" data-test="mercury-marker"></div>
        <div class="mercury-track__finish" :style="finishStyle" :title="$t('When the track is finished, the player with the most Mercury tags gets 2 VP at the end of the game.')">2</div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {CardResource} from '@/common/CardResource';
import {MARKET_COLUMN_CAP, MARKET_RESOURCES, MERCURY_TRACK, MERCURY_TRACK_MAX, MarketResource, MercuryModel, MercuryTrackReward} from '@/common/mercury/Mercury';
import {SpaceName} from '@/common/boards/SpaceName';
import {SpaceId} from '@/common/Types';
import {SpaceModel} from '@/common/models/SpaceModel';
import {range} from '@/common/utils/utils';
import {cardResourceCSS} from '@/client/components/common/cardResources';
import BoardSpace from '@/client/components/BoardSpace.vue';

const props = withDefaults(defineProps<{
  model: MercuryModel,
  spaces?: ReadonlyArray<SpaceModel>,
}>(), {
  spaces: () => [],
});

const MAP_WIDTH = 660;
const MAP_HEIGHT = 370;
// The planet (see .mercury-board__planet in mercury.less) and the track, which follows its rim just outside it.
const PLANET = {cx: 340, cy: 185, r: 170};
const TRACK = {r: 190, from: -54, to: 54}; // degrees, measured upwards from the planet's right-hand side

const marketColumns = MARKET_RESOURCES;
const marketCap = MARKET_COLUMN_CAP;

const areas: ReadonlyArray<{id: SpaceId, name: string, kind: 'forest' | 'city'}> = [
  {id: SpaceName.SHADOW_FOREST, name: 'Shadow Forest', kind: 'forest'},
  {id: SpaceName.NEW_POMPEII, name: 'New Pompeii', kind: 'city'},
];

function pointAt(degrees: number) {
  const a = degrees * Math.PI / 180;
  const nx = Math.cos(a);
  const ny = -Math.sin(a);
  return {x: PLANET.cx + TRACK.r * nx, y: PLANET.cy + TRACK.r * ny, nx, ny};
}

const ticks = range(MERCURY_TRACK_MAX + 1).map((step) => {
  const p = pointAt(TRACK.from + step * (TRACK.to - TRACK.from) / MERCURY_TRACK_MAX);
  return {step, x: Math.round(p.x), y: Math.round(p.y), nx: p.nx, ny: p.ny};
});

const arcPath = (() => {
  const start = pointAt(TRACK.from - 5);
  const end = pointAt(TRACK.to + 5);
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${TRACK.r} ${TRACK.r} 0 0 0 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
})();

const markerStyle = computed(() => {
  const tick = ticks[Math.max(0, Math.min(MERCURY_TRACK_MAX, props.model.track))];
  return {left: tick.x + 'px', top: tick.y + 'px'};
});

// The 2 VP bonus sits just inside the track's last step.
const finishStyle = (() => {
  const tick = ticks[MERCURY_TRACK_MAX];
  return {left: Math.round(tick.x - tick.nx * 28) + 'px', top: Math.round(tick.y - tick.ny * 28) + 'px'};
})();

const REWARD_TEXT: Record<MercuryTrackReward, string> = {
  asset: '1 asset',
  card: '1 card',
  standardResource: '1 standard resource',
  act: '1 Act card',
};

function prize(step: number) {
  return MERCURY_TRACK[step];
}

function prizeTitle(step: number): string {
  const space = MERCURY_TRACK[step];
  if (space === undefined) {
    return `${step}`;
  }
  const everyone = space.everyone.map((r) => REWARD_TEXT[r]).join(' + ');
  const rising = space.risingPlayer.map((r) => REWARD_TEXT[r]).join(' + ');
  return rising === '' ? `${step}. Everybody: ${everyone}` : `${step}. Everybody (*): ${everyone}. The player who raised it (^): ${rising}`;
}

function marketLabel(column: MarketResource): string {
  switch (column) {
  case 'microbe': return 'Microbes';
  case 'floater': return 'Floaters';
  case 'data': return 'Data';
  case 'other': return 'Other';
  }
}

function marketResourceCss(column: MarketResource, index: number): string {
  if (column !== 'other') {
    return 'mercury-market__resource ' + cardResourceCSS[column === 'microbe' ? CardResource.MICROBE : column === 'floater' ? CardResource.FLOATER : CardResource.DATA];
  }
  const resource = props.model.marketOther?.[index];
  return 'mercury-market__resource ' + (resource !== undefined ? cardResourceCSS[resource] : 'card-resource-wild-resource');
}

// Only the areas that exist in this game (they always do with Mercury, but old saves or tests may lack them).
const shownAreas = computed(() => areas.flatMap((area) => {
  const space = props.spaces.find((s) => s.id === area.id);
  return space === undefined ? [] : [{...area, space}];
}));
</script>
