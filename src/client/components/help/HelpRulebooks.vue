<template>
  <div class="help-rulebooks-container">
    <div class="help-rulebooks-section">
      <div class="help-icons-section-heading" v-i18n>Official Expansions</div>
      <div class="help-rulebook-rows">
        <a v-for="entry in officialExpansions" :key="entry.module" :href="entry.url" class="help-rulebook-row" target="_blank" v-i18n>
          <div :class="`create-game-expansion-icon expansion-icon-${entry.iconClass}`"></div>
          {{ entry.name }}
        </a>
      </div>
    </div>
    <div class="help-rulebooks-section">
      <div class="help-icons-section-heading" v-i18n>Fan Expansions</div>
      <div class="help-rulebook-rows">
        <a v-for="entry in fanExpansions" :key="entry.module" :href="entry.url" class="help-rulebook-row" target="_blank" v-i18n>
          <div :class="`create-game-expansion-icon expansion-icon-${entry.iconClass}`"></div>
          {{ entry.name }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {RULEBOOK_URLS} from '@/client/utils/WikiLinks';

interface RulebookEntry {
  module: string;
  name: string;
  iconClass: string;
  url: string;
}

const officialExpansions: ReadonlyArray<RulebookEntry> = [
  {module: 'corpera', name: 'Corporate Era', iconClass: 'CE', url: RULEBOOK_URLS.corpera},
  {module: 'venus', name: 'Venus Next', iconClass: 'venus', url: RULEBOOK_URLS.venus},
  {module: 'prelude', name: 'Prelude', iconClass: 'prelude', url: RULEBOOK_URLS.prelude},
  {module: 'prelude2', name: 'Prelude 2', iconClass: 'prelude2', url: RULEBOOK_URLS.prelude2},
  {module: 'colonies', name: 'Colonies', iconClass: 'colony', url: RULEBOOK_URLS.colonies},
  {module: 'turmoil', name: 'Turmoil', iconClass: 'turmoil', url: RULEBOOK_URLS.turmoil},
];

const fanExpansions: ReadonlyArray<RulebookEntry> = [
  {module: 'promo', name: 'Promos', iconClass: 'promo', url: RULEBOOK_URLS.promo},
  {module: 'ares', name: 'Ares', iconClass: 'ares', url: RULEBOOK_URLS.ares},
  {module: 'community', name: 'Community', iconClass: 'community', url: RULEBOOK_URLS.community},
  {module: 'moon', name: 'The Moon', iconClass: 'themoon', url: RULEBOOK_URLS.moon},
  {module: 'pathfinders', name: 'Pathfinders', iconClass: 'pathfinders', url: RULEBOOK_URLS.pathfinders},
  {module: 'ceo', name: 'CEOs', iconClass: 'ceo', url: RULEBOOK_URLS.ceo},
  {module: 'starwars', name: 'Star Wars', iconClass: 'starwars', url: RULEBOOK_URLS.starwars},
  {module: 'underworld', name: 'Underworld', iconClass: 'underworld', url: RULEBOOK_URLS.underworld},
  {module: 'deltaProject', name: 'Delta Project', iconClass: 'deltaProject', url: RULEBOOK_URLS.deltaProject},
  {module: 'betterments', name: 'Corporate Betterments', iconClass: 'betterments', url: RULEBOOK_URLS.betterments},
  {module: 'robantilles', name: 'Rob Antilles', iconClass: 'robantilles', url: RULEBOOK_URLS.robantilles},
  {module: 'solaris', name: 'Solaris', iconClass: 'solaris', url: RULEBOOK_URLS.solaris},
  {module: 'idesofmars', name: 'Ides of Mars', iconClass: 'idesofmars', url: RULEBOOK_URLS.idesofmars},
  {module: 'nuclear', name: 'Nuclear', iconClass: 'nuclear', url: RULEBOOK_URLS.nuclear},
  {module: 'venusphase2', name: 'Venus Phase 2', iconClass: 'venusphase2', url: RULEBOOK_URLS.venusphase2},
  {module: 'eternity', name: 'Eternity', iconClass: 'eternity', url: RULEBOOK_URLS.eternity},
  {module: 'industries', name: 'Industries', iconClass: 'industries', url: RULEBOOK_URLS.industries},
  {module: 'postludes', name: 'Postludes', iconClass: 'postludes', url: RULEBOOK_URLS.postludes},
];

export default defineComponent({
  name: 'HelpRulebooks',
  data() {
    return {
      officialExpansions,
      fanExpansions,
    };
  },
});
</script>
