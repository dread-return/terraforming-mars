<!-- Mercury vs Mars: the Acts in development, as Act cards with the two players named and their asset tracks filled in. -->
<template>
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
</template>

<script setup lang="ts">
import {Color} from '@/common/Color';
import {MercuryModel} from '@/common/mercury/Mercury';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import Card from '@/client/components/card/Card.vue';

const props = withDefaults(defineProps<{
  model: MercuryModel,
  players?: ReadonlyArray<PublicPlayerModel>,
}>(), {
  players: () => [],
});

function playerName(color: Color): string {
  return props.players.find((p) => p.color === color)?.name ?? color;
}
</script>
