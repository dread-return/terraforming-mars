<template>
  <div class="card-requirements" :class="{'card-requirements-max': hasMax}">
    <div v-for="(req, idx) in requirements" :key="idx">
      <CardRequirementComponent :requirement="req" :leftMargin="indentRight[idx]" :compact="compact" />
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import CardRequirementComponent from './CardRequirementComponent.vue';
import {CardRequirementDescriptor} from '@/common/cards/CardRequirementDescriptor';

export default defineComponent({
  name: 'CardRequirementsComponent',
  props: {
    requirements: {
      type: Array as () => ReadonlyArray<CardRequirementDescriptor>,
      required: false,
    },
  },
  components: {
    CardRequirementComponent,
  },
  computed: {
    hasMax(): boolean {
      return this.requirements?.some((req) => req.max) ?? false;
    },
    // When several requirements would draw more than 5 icons in a row, draw each as a number + 1 icon.
    compact(): boolean {
      const reqs = this.requirements ?? [];
      if (reqs.length < 2) {
        return false;
      }
      const icons = reqs.reduce((sum, req) => sum + (req.tag !== undefined && (req.count ?? 1) < 4 ? (req.count ?? 1) : 1), 0);
      return icons > 5;
    },
    indentRight(): ReadonlyArray<boolean> {
      const indentations = [false];
      if (this.requirements) {
        for (const req of this.requirements) {
          indentations.push(req.nextTo || false);
        }
      }
      return indentations;
    },
  },
});
</script>
