<template>
  <div v-if="typeof victoryPoints !== 'number'" :class="classes">
    <template v-if="victoryPoints.targetOneOrMore">
      <!-- This is the Search for Life special case. -->
      <div class="card-points-item-first">
        <CardRenderItemComponent v-if="victoryPoints.item !== undefined" :item="victoryPoints.item" data-test="item" />
        *:3
      </div>
    </template>
    <template v-else-if="victoryPoints.vermin">
      10
      <CardRenderItemComponent :item="animal" />
      : -1/
      <CardRenderItemComponent :item="city" />
      *
    </template>
    <template v-else>
      <template v-for="(term, t) in terms" :key="t">
        <div v-if="t > 0 && term.points >= 0" class="card-points-plus">+</div>
        <div v-if="pointsOf(term) !== ''">{{ pointsOf(term) }}</div>
        <div v-if="term.production === true && term.item !== undefined" class="card-production-box card-points-production">
          <div class="card-production-box-row">
            <div class="card-production-box-row-item">
              <CardRenderItemComponent :item="term.item" data-test="item" />
            </div>
          </div>
        </div>
        <CardRenderItemComponent v-else-if="term.item !== undefined" :item="term.item" data-test="item" />
        <template v-for="(extra, idx) in term.extraItems ?? []" :key="idx">
          <div v-if="(term.joiner ?? '+') !== ''" class="card-points-plus">{{ term.joiner ?? '+' }}</div>
          <CardRenderItemComponent :item="extra" />
        </template>
        <div v-if="t > 0 && term.asterisk === true">*</div>
      </template>
    </template>
    <div v-if="victoryPoints.asterisk === true">*</div>
  </div>
  <div v-else class="card-points card-points-big">{{ victoryPoints }}</div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import CardRenderItemComponent from '@/client/components/card/CardRenderItemComponent.vue';
import {CardRenderDynamicVictoryPoints} from '@/common/cards/render/CardRenderDynamicVictoryPoints';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {CardResource} from '@/common/CardResource';
import {ICardRenderItem} from '@/common/cards/render/Types';
import {Size} from '@/common/cards/render/Size';

export default defineComponent({
  name: 'CardVictoryPoints',
  props: {
    victoryPoints: {
      type: [Number, Object as () => CardRenderDynamicVictoryPoints],
      required: true,
    },
  },
  components: {
    CardRenderItemComponent,
  },
  methods: {
    pointsOf(vps: CardRenderDynamicVictoryPoints): string {
      if (vps.label !== undefined) {
        return vps.label;
      }
      if (vps.item === undefined && vps.points === 0 && vps.target === 0) {
        return '?';
      }
      if (vps.item === undefined) {
        return `${vps.points}`;
      }
      if (vps.target === vps.points || vps.target === 1) {
        return `${vps.points}/`;
      }
      if (vps.asFraction) {
        if (vps.target ===3 && vps.points === 1) {
          return '⅓';
        }
      }
      return `${vps.points}/${vps.target}`;
    },
  },
  computed: {
    classes(): string {
      if (typeof this.victoryPoints === 'number') {
        return '';
      } else {
        const classes: string[] = ['card-points'];
        if (this.victoryPoints.vermin) {
          classes.push('card-points-normal');
          classes.push('card-points-vermin');
          classes.push('red-outline');
        } else if (this.victoryPoints.anyPlayer) {
          classes.push('card-points-big');
          classes.push('red-outline');
        } else {
          classes.push('card-points-normal');
        }
        if ((this.victoryPoints.extraItems?.length ?? 0) > 0 || this.victoryPoints.also !== undefined) {
          classes.push('card-points-multi');
        }
        if (this.victoryPoints.also !== undefined) {
          classes.push('card-points-also');
        }
        return classes.join(' ');
      }
    },
    terms(): ReadonlyArray<CardRenderDynamicVictoryPoints> {
      if (typeof this.victoryPoints === 'number') {
        return [];
      }
      const vps = this.victoryPoints;
      return vps.also === undefined ? [vps] : [vps, vps.also];
    },
    animal(): ICardRenderItem {
      return {is: 'item', type: CardRenderItemType.RESOURCE, resource: CardResource.ANIMAL, size: Size.SMALL, amount: 1};
    },
    city(): ICardRenderItem {
      return {is: 'item', type: CardRenderItemType.CITY, size: Size.SMALL, amount: 1};
    },
  },
});

</script>

