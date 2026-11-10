<template>
  <div class="et-logo" :class="'et-logo-' + logo.slug">
    <div v-for="(line, i) in logo.lines" :key="i" :class="'et-line-' + i">{{ line }}</div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {CardName} from '@/common/cards/CardName';

type EternityLogo = {slug: string, lines: ReadonlyArray<string>};

/**
 * Eternity corporations: their names in the lettering of the printed cards.
 * Fonts and colours are in src/styles/eternity.less (`.et-logo-<slug>`).
 */
export const ETERNITY_LOGOS: Partial<Record<CardName, EternityLogo>> = {
  [CardName.ASTRO_SOILS]: {slug: 'astro-soils', lines: ['Astro Soils']},
  [CardName.BAMBOO_BUILDINGS]: {slug: 'bamboo', lines: ['BamBoo', 'Buildings']},
  [CardName.CASH_CO]: {slug: 'cash-co', lines: ['C.A.S.H. CO']},
  [CardName.DGT_MARS_CREW]: {slug: 'dgt', lines: ['DGT MARS CREW']},
  [CardName.EXOPLANET_BUILDERS]: {slug: 'exoplanet', lines: ['Exoplanet', 'Builders, Inc.']},
  [CardName.FARMS_OF_THE_FUTURE]: {slug: 'farms', lines: ['FARMS OF', 'THE FUTURE']},
  [CardName.GENERALIST_TERRAFORMA]: {slug: 'generalist', lines: ['GENERALIST', 'TERRAFORMA, INC']},
  [CardName.GENETICORP]: {slug: 'geneticorp', lines: ['GenetiCorp']},
  [CardName.INNASTAR_CORP]: {slug: 'innastar', lines: ['Innastar Corp']},
  [CardName.INTERPLANETARY_INTEREST_CHARGERS]: {slug: 'iic', lines: ['Interplanetary', 'Interest Chargers']},
  [CardName.IOA]: {slug: 'ioa', lines: ['IOA', 'Io Academy']},
  [CardName.JOVICORP]: {slug: 'jovicorp', lines: ['Jovicorp']},
  [CardName.MADNESS]: {slug: 'madness', lines: ['M@dN3$s?!']},
  [CardName.MARS_CONSERVATIONISTS]: {slug: 'conservationists', lines: ['MARS', 'CONSERVATIONISTS']},
  [CardName.MISERVISION]: {slug: 'miservision', lines: ['MiserVision']},
  [CardName.NEW_THORGATE]: {slug: 'new-thorgate', lines: ['NEW THORGATE']},
  [CardName.OIS]: {slug: 'ois', lines: ['O.I.S.', 'Open Intelligence Systems']},
  [CardName.POWERHOUSE]: {slug: 'powerhouse', lines: ['POWERHOUSE', 'international innovative technology']},
  [CardName.SHELL_CORPORATION]: {slug: 'shell', lines: ['SHELL', 'CORPORATION']},
  [CardName.THERMACORP]: {slug: 'thermacorp', lines: ['THERMACORP']},
  [CardName.THE_GARRISON_FOUNDATION]: {slug: 'garrison', lines: ['THE GARRISON', 'FOUNDATION']},
  [CardName.THE_VINES]: {slug: 'vines', lines: ['The Vines']},
  [CardName.TILLCO_40]: {slug: 'tillco', lines: ['TILLCO 40']},
  [CardName.VENUSIA]: {slug: 'venusia', lines: ['Venusia']},
  [CardName.WINGSPEARS_CORP]: {slug: 'wingspears', lines: ['WINGSPEARS', 'CORP']},
};

export default defineComponent({
  name: 'EternityCorpLogo',
  props: {
    title: {
      type: String as () => CardName,
      required: true,
    },
  },
  computed: {
    logo(): EternityLogo {
      return ETERNITY_LOGOS[this.title] ?? {slug: 'default', lines: [this.title]};
    },
  },
});
</script>
