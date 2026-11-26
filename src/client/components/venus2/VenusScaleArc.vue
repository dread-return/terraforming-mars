<!--
  The Venus scale, drawn as an arc over the top of the Venus map (Venus Phase 2), like the Mercury track around
  Mercury. 0% is at the lower left, the maximum at the lower right. Each step is a numbered cell; the bonuses for
  raising Venus onto a step sit just outside it. When this arc is shown, the Mars board leaves its own Venus track out.
-->
<template>
  <div class="venus-arc" data-test="venus-arc">
    <svg class="venus-arc__rail" :viewBox="'0 0 ' + WIDTH + ' ' + HEIGHT" aria-hidden="true">
      <path :d="railPath" class="venus-arc__rail-back" />
    </svg>
    <div class="venus-arc__cap" :style="capStyle" :title="$t('Venus')"></div>
    <div
      v-for="cell in cells"
      :key="cell.value"
      class="venus-arc__cell"
      :class="{'venus-arc__cell--current': cell.value === level, 'venus-arc__cell--bonus': cell.bonuses.length > 0}"
      :style="cell.style"
      :title="cell.title"
      :data-value="cell.value"
    >{{ cell.value }}</div>
    <template v-for="cell in cells" :key="'b' + cell.value">
      <div
        v-for="(bonus, i) in cell.bonuses"
        :key="bonus + i"
        class="venus-arc__bonus"
        :class="'venus-arc__bonus--' + bonus"
        :style="bonusStyle(cell, i)"
        :title="cell.title"
        :data-bonus="bonus"
      ></div>
    </template>
    <div class="venus-arc__end" :style="endStyle">
      <img v-if="level >= maxValue" src="assets/misc/circle-checkmark.png" width="18" :alt="$t('Completed!')">
      <span v-else>%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {BoardName} from '@/common/boards/BoardName';
import {venusTrackSpots, VenusTrackSpot, VenusTrackSpotBonus} from '@/common/venusNext/VenusTrack';

const props = withDefaults(defineProps<{
  level: number,
  boardName: BoardName,
  venusPhase2Track?: boolean,
  altVenusBoard?: boolean,
}>(), {
  venusPhase2Track: false,
  altVenusBoard: false,
});

// Geometry, matching the Venus map (assets/venus2/board.png): the planet is centred at (242, 170), radius 165.
const WIDTH = 490;
const HEIGHT = 340;
const CENTRE = {x: 242, y: 170};
const RADIUS = 187;
const BONUS_RADIUS = 216;
const BONUS_STEP = 26;
// Degrees, anticlockwise from the planet's right-hand side: 0% at the lower left, over the top, to the lower right.
const FROM = 207;
const TO = -27;

const BONUS_TEXT: Record<VenusTrackSpotBonus, string> = {
  drawcard: 'draw a card',
  tr: '1 TR',
  colony: 'place a colony',
  standardResource: '1 standard resource',
  wildResource: '1 resource of any kind',
};

type Cell = VenusTrackSpot & {angle: number, style: Record<string, string>, title: string};

function point(angle: number, radius: number): {x: number, y: number} {
  const a = angle * Math.PI / 180;
  return {x: CENTRE.x + radius * Math.cos(a), y: CENTRE.y - radius * Math.sin(a)};
}

function at(angle: number, radius: number): Record<string, string> {
  const p = point(angle, radius);
  return {left: p.x.toFixed(1) + 'px', top: p.y.toFixed(1) + 'px'};
}

const spots = computed(() => venusTrackSpots(props.boardName, props.venusPhase2Track, props.altVenusBoard));
const maxValue = computed(() => spots.value[spots.value.length - 1]?.value ?? 0);

const cells = computed<Array<Cell>>(() => {
  const n = spots.value.length;
  return spots.value.map((spot, i) => {
    const angle = FROM + (TO - FROM) * i / Math.max(1, n - 1);
    // Amber at 0%, pale gold at the top of the track.
    const t = i / Math.max(1, n - 1);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
    const top = `rgb(${mix(150, 236)}, ${mix(92, 198)}, ${mix(38, 112)})`;
    const bottom = `rgb(${mix(92, 168)}, ${mix(52, 128)}, ${mix(18, 56)})`;
    const bonusText = spot.bonuses.map((b) => BONUS_TEXT[b]).join(' + ');
    return {
      ...spot,
      angle,
      style: {...at(angle, RADIUS), background: `linear-gradient(${top}, ${bottom})`},
      title: `Venus ${spot.value}%` + (bonusText === '' ? '' : `: ${bonusText}`),
    };
  });
});

function bonusStyle(cell: Cell, index: number): Record<string, string> {
  return at(cell.angle, BONUS_RADIUS + index * BONUS_STEP);
}

const railPath = (() => {
  const start = point(FROM + 5, RADIUS);
  const end = point(TO - 5, RADIUS);
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${RADIUS} ${RADIUS} 0 1 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
})();

const capStyle = at(FROM + 11, RADIUS);
const endStyle = at(TO - 10, RADIUS);
</script>

<style scoped lang="less">
.venus-arc {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.venus-arc__rail {
  position: absolute;
  left: 0;
  top: 0;
  width: 490px;
  height: 340px;
  overflow: visible;
}

.venus-arc__rail-back {
  fill: none;
  stroke: rgba(0, 0, 0, 0.55);
  stroke-width: 26px;
  stroke-linecap: round;
}

.venus-arc__cell {
  position: absolute;
  width: 21px;
  height: 18px;
  margin: -9px 0 0 -10.5px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.6);
  box-sizing: border-box;
  font-family: Prototype, sans-serif;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 1px #000;
  pointer-events: auto;
  cursor: default;
}

.venus-arc__cell--bonus {
  border-color: #ffe7a8;
}

// The current level, like the active value on the Mars board's tracks.
.venus-arc__cell[class].venus-arc__cell--current {
  width: 26px;
  height: 22px;
  margin: -11px 0 0 -13px;
  line-height: 20px;
  font-size: 13px;
  z-index: 2;
  color: #000;
  text-shadow: none;
  background: #fff !important;
  border: 2px solid #ffcc64;
  box-shadow: 0 0 6px 2px rgba(255, 204, 100, 0.8);
}

.venus-arc__cap {
  position: absolute;
  width: 26px;
  height: 26px;
  margin: -13px 0 0 -13px;
  border-radius: 50%;
  background: url(/assets/tags/venus.png) center / 28px no-repeat;
  box-shadow: 0 0 0 1px #000, 0 1px 4px #000;
}

.venus-arc__end {
  position: absolute;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Prototype, sans-serif;
  font-size: 15px;
  color: #ffcc64;
  text-shadow: 0 0 3px #000;
}

.venus-arc__bonus {
  position: absolute;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 1px 2px #000);
  pointer-events: auto;
}

.venus-arc__bonus--drawcard {
  width: 18px;
  margin-left: -9px;
  background-image: url(/assets/resources/card.png);
  background-size: cover;
  border-radius: 2px;
  box-shadow: 0 0 0 1px #ddd;
}

.venus-arc__bonus--tr { background-image: url(/assets/resources/tr.png); }
.venus-arc__bonus--colony { background-image: url(/assets/tiles/colony.png); filter: drop-shadow(0 0 1px #fff) drop-shadow(0 1px 2px #000); }
.venus-arc__bonus--standardResource { background-image: url(/assets/resources/wild-std.png); width: 20px; height: 20px; margin: -10px 0 0 -10px; }
.venus-arc__bonus--wildResource { background-image: url(/assets/resources/wild.png); width: 20px; height: 20px; margin: -10px 0 0 -10px; }
</style>
