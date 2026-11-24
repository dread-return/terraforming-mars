<!--
  Mercury vs Mars: the Mercury board, drawn like the printed one. Mercury (NASA MESSENGER enhanced-colour
  map) with Market Colonies' stock, the New Pompeii and Shadow Forest areas, the Act deck and the curved
  Mercury track; the Acts in development are laid out under it as cards with their asset tracks filled in.
-->
<template>
  <div class="mercury-board" data-test="mercury-board">
    <div id="mercury_board" class="mercury-board__planet">
      <div class="mercury-board__title"><span class="mercury-board__symbol">☿</span><span v-i18n>Mercury</span></div>
      <div class="mercury-board__flavour" v-i18n>The smallest and innermost planet. Its shadowed polar craters hold water ice, its crust rare minerals and metals.</div>

      <!-- Market Colonies -->
      <div class="mercury-market" data-test="mercury-market">
        <div class="mercury-market__title"><span class="mercury-board__symbol">☿</span><span v-i18n>Market Colonies</span></div>
        <div class="mercury-market__rules">
          <div class="mercury-market__rule">
            <i class="mercury-icon mercury-icon--asset"></i>
            <span v-i18n>Colony bonus</span>
          </div>
          <div class="mercury-market__rule">
            <span><span v-i18n>Trade income</span><small v-i18n>gathered resources, one type, max 3</small></span>
          </div>
          <div class="mercury-market__rule">
            <span><span v-i18n>Colony charge</span><small v-i18n>unused resources</small></span>
            <span class="mercury-market__charge"><i class="mercury-icon mercury-icon--wild"></i>:<i class="mercury-icon mercury-icon--asset"></i></span>
          </div>
        </div>
        <div class="mercury-market__grid">
          <div v-for="column in marketColumns" :key="column" class="mercury-market__column" :data-test="'market-' + column" :title="marketLabel(column) + ': ' + model.market[column] + ' / ' + marketCap">
            <div class="mercury-market__head"><i class="mercury-icon" :class="'mercury-icon--' + column"></i></div>
            <div v-for="row in marketCap" :key="row" class="mercury-market__cell" :class="{'mercury-market__cell--full': row <= model.market[column]}">
              <i v-if="row <= model.market[column]" :class="marketResourceCss(column, row - 1)" data-test="market-resource"></i>
            </div>
          </div>
          <div class="mercury-market__rows">
            <span v-for="row in marketCap" :key="row">{{ row }}</span>
          </div>
        </div>
      </div>

      <!-- New Pompeii and Shadow Forest: board spaces, so tiles can be placed here. -->
      <div v-for="area in shownAreas" :key="area.space.id" class="mercury-area" :class="'mercury-area--' + area.kind">
        <svg class="mercury-area__frame" viewBox="0 0 120 138" aria-hidden="true">
          <polygon points="60,3 117,36 117,102 60,135 3,102 3,36" />
        </svg>
        <div class="mercury-area__art" :class="'mercury-area__art--' + area.kind"></div>
        <div class="mercury-area__name" v-i18n>{{ area.name }}</div>
        <BoardSpace :space="area.space" tileView="show" />
      </div>

      <!-- Act deck -->
      <div class="mercury-deck" :title="$t('Act deck') + ': ' + model.actDeckSize">
        <div class="mercury-deck__pile">
          <div class="mercury-deck__card"></div>
          <div class="mercury-deck__card"></div>
          <div class="mercury-deck__card"></div>
          <span class="mercury-deck__count" data-test="act-deck-size">{{ model.actDeckSize }}</span>
        </div>
        <div class="mercury-deck__label"><span v-i18n>Act deck</span> · <span v-i18n>discard</span> {{ model.actDiscardSize }}</div>
      </div>

      <!-- Mercury track -->
      <div class="mercury-track" data-test="mercury-track">
        <svg class="mercury-track__arc" :viewBox="'0 0 ' + PANEL_WIDTH + ' ' + PANEL_HEIGHT" aria-hidden="true">
          <path :d="arcPath" class="mercury-track__rail" />
          <line v-for="tick in ticks" :key="tick.step" :x1="tick.x - 7" :y1="tick.y" :x2="tick.x + 9" :y2="tick.y" class="mercury-track__tick" />
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
          <span class="mercury-track__number">{{ tick.step }}</span>
          <span v-if="prize(tick.step) !== undefined" class="mercury-track__everyone">
            <i v-for="(reward, i) in prize(tick.step)?.everyone" :key="i" class="mercury-icon" :class="'mercury-icon--' + reward"></i>
            <span class="mercury-track__star">*</span>
          </span>
          <span v-if="(prize(tick.step)?.risingPlayer.length ?? 0) > 0" class="mercury-track__rising">
            <i v-for="(reward, i) in prize(tick.step)?.risingPlayer" :key="i" class="mercury-icon" :class="'mercury-icon--' + reward"></i>
            <span class="mercury-track__caret">^</span>
          </span>
        </div>
        <div class="mercury-track__marker" :style="markerStyle" :title="$t('Mercury track') + ': ' + model.track" data-test="mercury-marker"></div>
        <div class="mercury-track__finish" :style="finishStyle" :title="$t('When the track is finished, the player with the most Mercury tags gets 2 VP at the end of the game.')">2</div>
      </div>

      <div class="mercury-board__credit">Mercury vs Mars · fan expansion by Aphi · Mercury: NASA/JHUAPL/Carnegie Institution of Washington</div>
    </div>

    <!-- Acts in development -->
    <div class="mercury-acts">
      <div class="mercury-acts__title" v-i18n>Acts in development</div>
      <div v-if="model.developments.length === 0" class="mercury-acts__empty" v-i18n>No Act is in development.</div>
      <div class="mercury-acts__list">
        <div v-for="dev in model.developments" :key="dev.card" class="mercury-acts__act" :class="'mercury-acts__act--' + dev.kind" data-test="mercury-act">
          <div class="mercury-acts__players">
            <span class="mercury-acts__player" :class="'player_bg_color_' + dev.initiator">{{ playerName(dev.initiator) }}</span>
            <span class="mercury-acts__versus" v-i18n>{{ dev.kind === 'treaty' ? 'with' : 'vs' }}</span>
            <span class="mercury-acts__player" :class="'player_bg_color_' + dev.partner">{{ playerName(dev.partner) }}</span>
          </div>
          <div class="mercury-acts__progress">
            <span v-for="side in (dev.kind === 'treaty' ? [0] : [0, 1])" :key="side" data-test="act-progress">{{ dev.progress[side] }} / {{ dev.steps[side] }}</span>
          </div>
          <Card :card="{name: dev.card}" :actDevelopment="dev" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {Color} from '@/common/Color';
import {CardResource} from '@/common/CardResource';
import {MARKET_COLUMN_CAP, MARKET_RESOURCES, MERCURY_TRACK, MERCURY_TRACK_MAX, MarketResource, MercuryModel, MercuryTrackReward} from '@/common/mercury/Mercury';
import {SpaceName} from '@/common/boards/SpaceName';
import {SpaceId} from '@/common/Types';
import {SpaceModel} from '@/common/models/SpaceModel';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import {range} from '@/common/utils/utils';
import {cardResourceCSS} from '@/client/components/common/cardResources';
import BoardSpace from '@/client/components/BoardSpace.vue';
import Card from '@/client/components/card/Card.vue';

const props = withDefaults(defineProps<{
  model: MercuryModel,
  spaces?: ReadonlyArray<SpaceModel>,
  players?: ReadonlyArray<PublicPlayerModel>,
}>(), {
  spaces: () => [],
  players: () => [],
});

const PANEL_WIDTH = 890;
const PANEL_HEIGHT = 600;
// The track bends around Mercury like on the printed board: a slice of a large circle whose centre is far to the left.
const ARC = {cx: 168, cy: 300, r: 600, bottom: 566, top: 46};

const marketColumns = MARKET_RESOURCES;
const marketCap = MARKET_COLUMN_CAP;

const areas: ReadonlyArray<{id: SpaceId, name: string, kind: 'forest' | 'city'}> = [
  {id: SpaceName.SHADOW_FOREST, name: 'Shadow Forest', kind: 'forest'},
  {id: SpaceName.NEW_POMPEII, name: 'New Pompeii', kind: 'city'},
];

function arcX(y: number): number {
  return ARC.cx + Math.sqrt(ARC.r * ARC.r - (y - ARC.cy) * (y - ARC.cy));
}

const ticks = range(MERCURY_TRACK_MAX + 1).map((step) => {
  const y = ARC.bottom - step * (ARC.bottom - ARC.top) / MERCURY_TRACK_MAX;
  return {step, x: Math.round(arcX(y)), y: Math.round(y)};
});

const arcPath = (() => {
  const top = ARC.top - 18;
  const bottom = ARC.bottom + 18;
  return `M ${arcX(bottom).toFixed(1)} ${bottom} A ${ARC.r} ${ARC.r} 0 0 0 ${arcX(top).toFixed(1)} ${top}`;
})();

const markerStyle = computed(() => {
  const tick = ticks[Math.max(0, Math.min(MERCURY_TRACK_MAX, props.model.track))];
  return {left: tick.x + 'px', top: tick.y + 'px'};
});

const finishStyle = (() => {
  const tick = ticks[MERCURY_TRACK_MAX];
  return {left: (tick.x - 48) + 'px', top: (tick.y - 4) + 'px'};
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

function playerName(color: Color): string {
  return props.players.find((p) => p.color === color)?.name ?? color;
}
</script>
