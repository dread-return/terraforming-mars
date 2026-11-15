<template>
  <div class="infrastructures-menu" data-test="infrastructures-menu">
    <div v-if="showtitle === true">{{ $t(playerinput.title) }}</div>
    <div class="infrastructure-sectors">
      <div v-for="sector in playerinput.sectors" :key="sector.category" class="infrastructure-sector" :data-test="'infrastructure-sector-' + sector.category">
        <div class="infrastructure-sector-title" v-i18n>{{ sectorTitle(sector) }}</div>
        <div class="infrastructure-sector-cube-row">
          <div v-if="sector.usedBy !== undefined"
            :class="'board-cube board-cube--' + sector.usedBy"
            :title="$t('Used this generation')"
            :data-test="'infrastructure-cube-' + sector.category"></div>
        </div>
        <div class="infrastructure-sector-cards">
          <label v-for="stack in sector.stacks" :key="stack.card" class="payments_cards infrastructure-stack" :data-test="'infrastructure-stack-' + stack.card">
            <input v-if="stack.disabledReason === undefined" class="hidden" type="radio" v-model="selected" :value="stack.card">
            <Card class="cardbox" :card="cardModel(stack)" />
            <div class="infrastructure-stack-info">
              <span v-i18n>{{ stack.remaining }}</span>&nbsp;<span v-i18n>left</span>
            </div>
            <div v-if="stack.disabledReason !== undefined" class="infrastructure-stack-reason" v-i18n>{{ stack.disabledReason }}</div>
          </label>
        </div>
      </div>
    </div>
    <div v-if="showsave === true" class="wf-action">
      <AppButton :title="$t(playerinput.buttonLabel)" type="submit" size="normal" :disabled="selected === undefined" @click="saveData" />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Card from '@/client/components/card/Card.vue';
import AppButton from '@/client/components/common/AppButton.vue';
import {SelectInfrastructureModel} from '@/common/models/PlayerInputModel';
import {SelectInfrastructureResponse} from '@/common/inputs/InputResponse';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import {CardName} from '@/common/cards/CardName';
import {CardModel} from '@/common/models/CardModel';
import {INFRASTRUCTURE_CATEGORY_TITLES, InfrastructureSectorModel, InfrastructureStackModel} from '@/common/highOrbit/HighOrbit';

type DataModel = {
  selected: CardName | undefined;
};

export default defineComponent({
  name: 'SelectInfrastructure',
  components: {
    Card,
    AppButton,
  },
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
      required: true,
    },
    playerinput: {
      type: Object as () => SelectInfrastructureModel,
      required: true,
    },
    onsave: {
      type: Function as unknown as () => (out: SelectInfrastructureResponse) => void,
      required: true,
    },
    showsave: {
      type: Boolean,
    },
    showtitle: {
      type: Boolean,
    },
  },
  data(): DataModel {
    // Preselect the first stack the player can buy.
    for (const sector of this.playerinput.sectors) {
      for (const stack of sector.stacks) {
        if (stack.disabledReason === undefined) {
          return {selected: stack.card};
        }
      }
    }
    return {selected: undefined};
  },
  methods: {
    sectorTitle(sector: InfrastructureSectorModel): string {
      return INFRASTRUCTURE_CATEGORY_TITLES[sector.category];
    },
    cardModel(stack: InfrastructureStackModel): CardModel {
      return {name: stack.card, isDisabled: stack.disabledReason !== undefined};
    },
    canSave(): boolean {
      return this.selected !== undefined;
    },
    saveData() {
      if (this.selected === undefined) {
        return;
      }
      this.onsave({type: 'infrastructure', card: this.selected});
    },
  },
});
</script>
