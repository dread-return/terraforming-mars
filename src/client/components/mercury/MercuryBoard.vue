<!-- Mercury vs Mars: the Mercury planetary track, Market Colonies' stock and the Acts in development. -->
<template>
  <div class="mercury-board" data-test="mercury-board">
    <div class="mercury-board__title" v-i18n>Mercury</div>

    <div class="mercury-board__section">
      <div class="mercury-board__subtitle" v-i18n>Mercury track</div>
      <div class="mercury-track" data-test="mercury-track">
        <div
          v-for="step in steps"
          :key="step"
          class="mercury-track__cell"
          :class="{'mercury-track__cell--current': step === model.track, 'mercury-track__cell--passed': step < model.track, 'mercury-track__cell--prize': prize(step) !== undefined}"
          :title="prizeTitle(step)"
          :data-step="step"
        >
          <span class="mercury-track__number">{{ step }}</span>
          <span v-if="prize(step) !== undefined" class="mercury-track__dot"></span>
        </div>
      </div>
      <div class="mercury-board__help" v-i18n>
        Each Mercury tag raises the track 1 step. On a dot everybody gets the prize, and the player who raised it gets the bonus too. When the track is finished, the player with the most Mercury tags gets 2 VP at the end of the game.
      </div>
    </div>

    <div class="mercury-board__section">
      <div class="mercury-board__subtitle" v-i18n>Market Colonies</div>
      <div class="mercury-market" data-test="mercury-market">
        <div v-for="column in marketColumns" :key="column" class="mercury-market__column" :data-test="'market-' + column">
          <span class="mercury-market__label" v-i18n>{{ marketLabel(column) }}</span>
          <span class="mercury-market__count">{{ model.market[column] }} / {{ marketCap }}</span>
        </div>
      </div>
    </div>

    <div class="mercury-board__section">
      <div class="mercury-board__subtitle">
        <span v-i18n>Acts in development</span>
        <span class="mercury-board__deck">(<span v-i18n>Act deck</span>: {{ model.actDeckSize }})</span>
      </div>
      <div v-if="model.developments.length === 0" class="mercury-board__empty" v-i18n>No Act is in development.</div>
      <div
        v-for="dev in model.developments"
        :key="dev.card"
        class="mercury-act"
        :class="'mercury-act--' + dev.kind"
        data-test="mercury-act"
      >
        <div class="mercury-act__name">
          <span class="mercury-act__kind" v-i18n>{{ dev.kind === 'treaty' ? 'Treaty' : 'Rivalry' }}</span>
          {{ titleOf(dev.card) }}
        </div>
        <template v-if="dev.kind === 'treaty'">
          <div class="mercury-act__track">
            <i :class="cubeCss(dev.initiator)" class="mercury-act__cube"></i>
            <i :class="cubeCss(dev.partner)" class="mercury-act__cube"></i>
            <span class="mercury-act__bar"><span class="mercury-act__fill" :style="{width: percent(dev.progress[0], dev.steps[0])}"></span></span>
            <span class="mercury-act__count" data-test="act-progress">{{ dev.progress[0] }} / {{ dev.steps[0] }}</span>
          </div>
        </template>
        <template v-else>
          <div v-for="side in [0, 1]" :key="side" class="mercury-act__track">
            <i :class="cubeCss(side === 0 ? dev.initiator : dev.partner)" class="mercury-act__cube"></i>
            <span class="mercury-act__bar"><span class="mercury-act__fill" :style="{width: percent(dev.progress[side], dev.steps[side])}"></span></span>
            <span class="mercury-act__count" data-test="act-progress">{{ dev.progress[side] }} / {{ dev.steps[side] }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Color} from '@/common/Color';
import {MARKET_COLUMN_CAP, MARKET_RESOURCES, MERCURY_TRACK, MERCURY_TRACK_MAX, MarketResource, MercuryModel, MercuryTrackReward} from '@/common/mercury/Mercury';
import {CardName} from '@/common/cards/CardName';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {range} from '@/common/utils/utils';

defineProps<{
  model: MercuryModel,
}>();

const steps = range(MERCURY_TRACK_MAX + 1);
const marketColumns = MARKET_RESOURCES;
const marketCap = MARKET_COLUMN_CAP;

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
    return '';
  }
  const everyone = space.everyone.map((r) => REWARD_TEXT[r]).join(' + ');
  const rising = space.risingPlayer.map((r) => REWARD_TEXT[r]).join(' + ');
  return rising === '' ? `Everybody: ${everyone}` : `Everybody: ${everyone}. The player who raised it: ${rising}`;
}

function marketLabel(column: MarketResource): string {
  switch (column) {
  case 'microbe': return 'Microbes';
  case 'floater': return 'Floaters';
  case 'data': return 'Data';
  case 'other': return 'Other';
  }
}

function titleOf(card: CardName): string {
  return card.split(':')[0];
}

function percent(value: number, max: number): string {
  return max <= 0 ? '0%' : `${Math.min(100, Math.round(100 * value / max))}%`;
}

function cubeCss(color: Color): string {
  const css = 'board-cube board-cube--' + color;
  return getPreferences().symbol_overlay ? css + ' overlay' : css;
}
</script>

<style scoped lang="less">
.mercury-board {
  margin: 20px;
  padding: 10px 12px 12px;
  display: block;
  overflow-x: auto;
  background: #3a3530;
  border-radius: 4px;
  color: #ece4d8;
}

.mercury-board__title {
  font-family: Prototype, sans-serif;
  font-size: 18px;
  margin-bottom: 8px;
}

.mercury-board__section {
  margin-bottom: 10px;
}

.mercury-board__subtitle {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.mercury-board__deck {
  font-weight: normal;
  margin-left: 6px;
}

.mercury-board__help, .mercury-board__empty {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.mercury-track {
  display: flex;
  gap: 2px;
}

.mercury-track__cell {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 4px;
  background: #5a524a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mercury-track__cell--passed {
  background: #7a6a55;
}

.mercury-track__cell--current {
  background: #d8b45a;
  color: #222;
  font-weight: bold;
}

.mercury-track__dot {
  position: absolute;
  bottom: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}

.mercury-market {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.mercury-market__column {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  background: #4a433c;
  border-radius: 4px;
}

.mercury-act {
  margin: 4px 0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.mercury-act--treaty {
  background: #5c4a1f;
}

.mercury-act--rivalry {
  background: #44484e;
}

.mercury-act__kind {
  font-size: 11px;
  text-transform: uppercase;
  margin-right: 6px;
  opacity: 0.8;
}

.mercury-act__track {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.mercury-act__cube {
  display: inline-block;
  width: 16px;
  height: 16px;
}

.mercury-act__bar {
  display: inline-block;
  width: 160px;
  height: 10px;
  background: #222;
  border-radius: 5px;
  overflow: hidden;
}

.mercury-act__fill {
  display: block;
  height: 100%;
  background: #e2c15f;
}
</style>
