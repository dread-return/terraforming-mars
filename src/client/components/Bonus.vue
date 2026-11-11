<template>
  <div class="board-space-bonuses">
    <i v-for="(spaceBonus, idx) in bonus" :key="idx" :class="getClass(idx + 1, spaceBonus)"></i>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {SpaceBonus} from '@/common/boards/SpaceBonus';

const css: Record<SpaceBonus, string> = {
  [SpaceBonus.TITANIUM]: 'titanium',
  [SpaceBonus.STEEL]: 'steel',
  [SpaceBonus.PLANT]: 'plant',
  [SpaceBonus.DRAW_CARD]: 'card',
  [SpaceBonus.HEAT]: 'heat',
  [SpaceBonus.OCEAN]: 'bonusocean',
  [SpaceBonus.MEGACREDITS]: 'megacredits', // Ares adjacency, and Industries placing M€ on an area.
  [SpaceBonus.ANIMAL]: 'animal',
  [SpaceBonus.MICROBE]: 'microbe',
  [SpaceBonus.ENERGY]: 'energy',
  [SpaceBonus.DATA]: 'data',
  [SpaceBonus.SCIENCE]: 'science',
  [SpaceBonus.ENERGY_PRODUCTION]: 'energy-production',
  [SpaceBonus._TEMPERATURE_3MC]: '', // Deprecated, migrated to TEMPERATURE_4MC.
  [SpaceBonus.ASTEROID]: 'asteroid',
  [SpaceBonus.DELEGATE]: 'delegate',
  [SpaceBonus.COLONY]: 'colony',
  [SpaceBonus._RESTRICTED]: '', // RESTRICTED is just a that a space is empty, not an actual bonus.
  [SpaceBonus.TEMPERATURE_4MC]: 'bonustemperature4mc',
  [SpaceBonus.STANDARD_RESOURCE]: 'standard-resource',
  [SpaceBonus.INCENTIVE_5MC]: 'incentive5mc',
};

export default defineComponent({
  name: 'Bonus',
  props: {
    bonus: {
      type: Array as () => Array<SpaceBonus>,
      required: true,
    },
  },
  methods: {
    getClass(idx: number, bonus: SpaceBonus): string {
      const doubleWideBonuses = [
        SpaceBonus.OCEAN,
        SpaceBonus.TEMPERATURE_4MC,
        SpaceBonus.COLONY,
      ];
      // If only one bonus is present, center it.
      // Except: some bonuses occupy 2 spaces.
      let position: string | number = idx;
      if (this.bonus.length === 1 && !doubleWideBonuses.includes(bonus)) {
        position = 'only';
      } else if (this.bonus.length > 3) {
        // Crowded spaces, e.g. after an industry places resources, draw smaller icons in a grid.
        position = `grid-${idx}`;
      }
      return `board-space-bonus board-space-bonus--${css[bonus]} board-space-bonus-pos--${position}`;
    },
  },
});

</script>

