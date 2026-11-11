<template>
  <div class="help-turmoil-parties-container">
    <h2 v-i18n>Political Parties</h2>
    <p v-i18n>A party bonus is granted once, during the Turmoil phase. Its policy applies ONLY DURING THE ACTION PHASE of the following generation.</p>

    <div class="help-parties-grid">
      <div class="help-party-card" v-for="party in standardParties" :key="party.name">
        <HelpParty :party="party" />
      </div>
    </div>

    <h2 v-i18n>Giga Turmoil</h2>
    <p v-i18n>With Giga Turmoil, six of twelve parties are drafted at the start of the game, and every party has the bonuses and policies listed here. The chairman picks both the bonus and the policy.</p>
    <p v-i18n>Some options are missing because they need parts of the game that do not exist yet: Kelvinists, Populists, Spome and Transhumanists have fewer options for now.</p>

    <div class="help-parties-grid">
      <div class="help-party-card" v-for="party in gigaParties" :key="party.name">
        <HelpParty :party="party" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {PartyName, OFFICIAL_PARTIES} from '@/common/turmoil/PartyName';
import {agendaInfoById, BONUS_IDS, BonusId, POLICY_IDS, PolicyId, isGigaAgendaId} from '@/common/turmoil/Types';
import {getAgenda} from '@/client/turmoil/ClientAgendaManifest';
import HelpParty, {PartyHelpEntry} from '@/client/components/help/HelpParty.vue';

function entries(names: ReadonlyArray<PartyName>, giga: boolean): Array<PartyHelpEntry> {
  // Options that have not been built yet have no description, so they are left out.
  const known = (id: BonusId | PolicyId) => isGigaAgendaId(id) === giga && getAgenda(id) !== undefined;
  return names.map((name) => ({
    name,
    bonusIds: BONUS_IDS.filter((id) => known(id) && agendaInfoById(id).name === name),
    policyIds: POLICY_IDS.filter((id) => known(id) && agendaInfoById(id).name === name),
  }));
}

const standardParties = entries(OFFICIAL_PARTIES, false);
const gigaParties = entries(Object.values(PartyName), true);
</script>
