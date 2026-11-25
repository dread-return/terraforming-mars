<template>
  <div class="milestones_cont">
    <div class="milestones">
      <div class="ma-title">
        <a class="ma-clickable" href="#" @click.prevent="toggleList()" v-i18n>Milestones</a>
        <span v-for="milestone in milestones.filter((m) => m.playerName)" :key="milestone.name" class="milestone-award-inline paid" :title="milestone.playerName">
          <span v-i18n>{{ milestone.name }}</span>
          <span class="ma-player-cube"><i :class="'board-cube board-cube--'+milestone.color"></i></span>
          <span v-for="other in milestone.sharedWith ?? []" :key="other.color" class="ma-player-cube"><i :class="'board-cube board-cube--'+other.color"></i></span>
        </span>
        <span v-for="(spotPrice, index) in availableMilestoneSpots" :key="index" class="milestone-award-inline unpaid">
          <div class="milestone-award-price">{{ spotPrice }}</div>
        </span>
      </div>
      <span @click="toggleDescription" :title="$t('press to show or hide the description')" data-test="toggle-description">
        <div v-show="showMilestoneDetails">
          <Milestone
            v-for="milestone in milestones"
            :key="milestone.name"
            :milestone="milestone"
            :showScores="showScores"
            :showDescription="showDescription"
          />
        </div>
      </span>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {MILESTONE_COST} from '@/common/constants';
import {BoardName} from '@/common/boards/BoardName';
import {getMilestoneAwardLimits} from '@/common/ma/MilestoneAwardLimits';
import Milestone from '@/client/components/Milestone.vue';
import {ClaimedMilestoneModel} from '@/common/models/ClaimedMilestoneModel';
import {Preferences, PreferencesManager} from '@/client/utils/PreferencesManager';

export default defineComponent({
  name: 'Milestones',
  props: {
    milestones: {
      type: Array as () => ReadonlyArray<ClaimedMilestoneModel>,
      required: true,
    },
    showScores: {
      type: Boolean,
      default: true,
    },
    preferences: {
      type: Object as () => Readonly<Preferences>,
      default: () => PreferencesManager.INSTANCE.values(),
    },
    // The GIGA board allows more claims.
    boardName: {
      type: String as () => BoardName,
      default: BoardName.THARSIS,
    },
  },
  data() {
    const maxMilestones = getMilestoneAwardLimits(this.boardName).maxMilestones;
    return {
      showMilestoneDetails: (this.milestones.filter((milestone) => milestone.playerName).length === maxMilestones ? false : this.preferences?.show_milestone_details),
      showDescription: false,
    };
  },
  components: {
    Milestone,
  },
  computed: {
    availableMilestoneSpots(): Array<number> {
      const count = this.milestones.filter((milestone) => milestone.playerName).length;
      return Array(Math.max(0, getMilestoneAwardLimits(this.boardName).maxMilestones - count)).fill(MILESTONE_COST);
    },
  },
  methods: {
    toggleDescription() {
      this.showDescription = !this.showDescription;
    },
    toggleList() {
      this.showMilestoneDetails = !this.showMilestoneDetails;
      PreferencesManager.INSTANCE.set('show_milestone_details', this.showMilestoneDetails);
    },
  },
});
</script>
