<!-- Nuclear (GIGA): the global contamination track, shown next to the board whenever Nuclear is on. -->
<template>
  <div class="contamination-track" data-test="contamination-track">
    <div class="contamination-track-header">
      <div class="contamination-track-icon"></div>
      <div>
        <div class="contamination-track-title" v-i18n>Contamination</div>
        <div class="contamination-track-level">{{ level }} / {{ max }}</div>
      </div>
    </div>
    <div class="contamination-track-steps">
      <div v-for="step in steps"
        :key="step.value"
        class="contamination-step"
        :class="{'contamination-step--current': step.value === level, 'contamination-step--passed': step.value < level}"
        :title="step.title">
        <div class="contamination-step-marker">
          <div v-if="step.value === level" class="contamination-step-cube"></div>
        </div>
        <div class="contamination-step-number" :style="{background: step.color}">{{ step.value }}</div>
        <div class="contamination-step-reward">
          <div v-if="step.reward === 'nuclearZone'" class="contamination-reward-nuclear-zone"></div>
          <template v-else-if="step.reward !== undefined">
            <div v-for="n in step.reward.count" :key="n" class="contamination-reward-resource" :class="'contamination-reward-' + step.reward.kind"></div>
          </template>
        </div>
      </div>
    </div>
    <div class="contamination-track-help" v-i18n>Every radioactive tag played moves the marker up 1 step. The player who moves it onto a step with a reward gets the reward.</div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ContaminationReward, ContaminationTrack, contaminationTrack, describeContaminationReward} from '@/common/nuclear/Contamination';
import {range} from '@/common/utils/utils';

/** A resource reward drawn as `count` icons of `kind`. */
type ResourceReward = {kind: 'radiation' | 'heat' | 'energy' | 'data' | 'science', count: number};

type Step = {
  value: number,
  reward: 'nuclearZone' | ResourceReward | undefined,
  title: string,
  color: string,
};

function toDisplay(reward: ContaminationReward): 'nuclearZone' | ResourceReward {
  if ('nuclearZone' in reward) {
    return 'nuclearZone';
  } else if ('radiation' in reward) {
    return {kind: 'radiation', count: reward.radiation};
  } else if ('heat' in reward) {
    return {kind: 'heat', count: reward.heat};
  } else if ('energy' in reward) {
    return {kind: 'energy', count: reward.energy};
  } else if ('data' in reward) {
    return {kind: 'data', count: reward.data};
  } else {
    return {kind: 'science', count: reward.science};
  }
}

export default defineComponent({
  name: 'ContaminationTrack',
  props: {
    level: {
      type: Number,
      required: true,
    },
    // True when the game uses the Alt. Contamination track (from the GIGA rules).
    alt: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    track(): ContaminationTrack {
      return contaminationTrack(this.alt);
    },
    max(): number {
      return this.track.max;
    },
    // Highest step first, so the track reads bottom to top.
    steps(): Array<Step> {
      const max = this.track.max;
      return range(max + 1).reverse().map((value) => {
        const reward = this.track.rewards[value];
        // From green at the bottom of the track to black at the top, as on the GIGA board.
        const t = value / max;
        const color = `rgb(${Math.round(110 * (1 - t))}, ${Math.round(170 * (1 - t) + 20)}, ${Math.round(20 * (1 - t))})`;
        return {
          value,
          reward: reward === undefined ? undefined : toDisplay(reward),
          title: reward === undefined ? `Step ${value}` : `Step ${value}: ${describeContaminationReward(reward)}`,
          color,
        };
      });
    },
  },
});
</script>
