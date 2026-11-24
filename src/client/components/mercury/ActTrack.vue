<!--
  Mercury vs Mars: the asset track printed on an Act card.
  A Treaty has one shared row along the bottom; a Rivalry has a column on each side, the initiator's on the
  left and the challenged player's on the right. The last step of each shows the handshake.
  With a development, the assets already added are filled in and the players' cubes sit on the start squares.
-->
<template>
  <div class="act-track" :class="'act-track--' + kind" :title="title" data-test="act-track">
    <div v-for="side in sides" :key="side" class="act-track__line" :class="'act-track__line--' + side">
      <div class="act-track__start" data-test="act-start">
        <template v-if="development !== undefined">
          <i v-for="color in startCubes(side)" :key="color" :class="cubeCss(color)" class="act-track__cube"></i>
        </template>
      </div>
      <div
        v-for="step in steps[sideIndex(side)]"
        :key="step"
        class="act-track__step"
        :class="{'act-track__step--handshake': step === steps[sideIndex(side)], 'act-track__step--filled': step <= filled(side)}"
        :data-test="step <= filled(side) ? 'act-step-filled' : 'act-step'"
      >
        <i v-if="step <= filled(side)" :class="fillCss(side)"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {Color} from '@/common/Color';
import {ActKind, ActDevelopmentModel} from '@/common/mercury/Mercury';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {translateText} from '@/client/directives/i18n';

type Side = 'shared' | 'initiator' | 'partner';

const props = defineProps<{
  kind: ActKind,
  steps: [number, number],
  development?: ActDevelopmentModel,
}>();

const sides = computed<Array<Side>>(() => props.kind === 'treaty' ? ['shared'] : ['initiator', 'partner']);

const title = computed(() => {
  if (props.kind === 'treaty') {
    return translateText('Assets needed to resolve this Treaty') + `: ${props.steps[0]}`;
  }
  return translateText('Assets needed to win this Rivalry: initiator / challenged player') + `: ${props.steps[0]} / ${props.steps[1]}`;
});

function sideIndex(side: Side): number {
  return side === 'partner' ? 1 : 0;
}

function filled(side: Side): number {
  return props.development?.progress[sideIndex(side)] ?? 0;
}

function startCubes(side: Side): Array<Color> {
  const dev = props.development;
  if (dev === undefined) {
    return [];
  }
  switch (side) {
  case 'shared': return [dev.initiator, dev.partner];
  case 'initiator': return [dev.initiator];
  case 'partner': return [dev.partner];
  }
}

function cubeCss(color: Color): string {
  const css = 'board-cube board-cube--' + color;
  return getPreferences().symbol_overlay ? css + ' overlay' : css;
}

// A Treaty's assets are shared, so they show as asset tokens; a Rivalry's in its player's colour.
function fillCss(side: Side): string {
  const dev = props.development;
  if (side === 'shared' || dev === undefined) {
    return 'act-track__asset';
  }
  return cubeCss(side === 'initiator' ? dev.initiator : dev.partner) + ' act-track__cube';
}
</script>
