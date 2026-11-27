<!--
  Giga Turmoil policies, drawn from the game's own card icons (M€, cards, tags, tiles, production boxes, arrows)
  the way the official parties' policies are, instead of the rulebook's token images. Each layout follows the
  printed token.
-->
<template>
  <div class="card-container giga-policy" :data-policy="id">
    <!-- Bureaucrats -->
    <template v-if="id === 'Bp01'">
      <div class="giga-policy__row"><span class="giga-policy__text">max 2</span><div class="card-special card-plus"></div><div class="card-influence card-influence--size-S"></div></div>
      <div class="giga-policy__row"><div class="giga-policy__action-bar">ACTION</div></div>
      <div class="giga-policy__row"><div class="card-special card-red-arrow"></div></div>
    </template>
    <template v-else-if="id === 'Bp02'">
      <div class="giga-policy__row"><span class="giga-policy__text">every turn</span><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row"><div class="card-resource card-resource-money">-3</div><div class="card-special card-plus"></div><div class="card-influence card-influence--size-S"></div></div>
    </template>
    <template v-else-if="id === 'Bp03'">
      <div class="giga-policy__row"><div class="card-delegate"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">3</div></div>
    </template>
    <template v-else-if="id === 'Bp04'">
      <div class="giga-policy__row"><div class="card-resource card-card"></div><div class="card-special card-colon">:</div><div class="card-special card-minus"></div><div class="card-resource card-card"></div></div>
      <div class="giga-policy__row"><div class="card-chairman giga-policy__cancelled"></div></div>
    </template>

    <!-- Centrists -->
    <template v-else-if="id === 'Cp01'">
      <div class="giga-policy__row"><div class="card-resource card-resource-steel"></div><div class="card-resource card-resource-titanium"></div><div class="card-resource card-resource-plant"></div><div class="card-resource card-resource-energy"></div><div class="card-resource card-resource-heat"></div></div>
      <div class="giga-policy__row"><div class="card-special card-red-arrow"></div><div class="card-resource card-resource-money">15</div></div>
    </template>
    <template v-else-if="id === 'Cp02'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">7</div><div class="card-special card-red-arrow"></div></div>
      <div class="giga-policy__row"><div class="card-special card-plus"></div>
        <div class="card-production-box"><div class="card-production-box-row"><div class="card-production-box-row-item"><div class="card-item-container"><span class="giga-policy__lowest">&lt;</span></div></div></div></div>
      </div>
    </template>
    <template v-else-if="id === 'Cp03'">
      <div class="giga-policy__row"><div class="giga-policy__new-tag"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">4</div></div>
    </template>
    <template v-else-if="id === 'Cp04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon giga-policy__new-tag giga-policy__new-tag--icon"></div></div></div>
    </template>

    <!-- Empower -->
    <template v-else-if="id === 'Ep01'">
      <div class="giga-policy__row"><div class="card-resource card-resource-energy"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">2</div></div>
    </template>
    <template v-else-if="id === 'Ep02'">
      <div class="giga-policy__row">
        <div class="card-production-box"><div class="card-production-box-row"><div class="card-production-box-row-item"><div class="card-item-container"><span class="giga-policy__text giga-policy__text--dark">±</span><div class="card-resource card-resource-energy"></div></div></div></div></div>
        <div class="card-special card-colon">:</div><span class="giga-policy__text">2</span><div class="card-resource card-resource-energy"></div>
      </div>
    </template>
    <template v-else-if="id === 'Ep03'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-power"></div><div class="card-resource-tag tag-power"></div></div>
    </template>
    <template v-else-if="id === 'Ep04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-power"></div></div><div class="card-special card-slash">/</div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-radioactive"></div></div></div>
    </template>

    <!-- Greens -->
    <template v-else-if="id === 'Gp01'">
      <div class="giga-policy__row"><div class="card-tile greenery-tile tile-size--M"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">4</div></div>
    </template>
    <template v-else-if="id === 'Gp02'">
      <div class="giga-policy__row"><div class="card-tile empty-tile tile-size--M"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-plant"></div></div>
    </template>
    <template v-else-if="id === 'Gp03'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-plant"></div><div class="card-resource-tag tag-microbe"></div><div class="card-resource-tag tag-animal"></div><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row"><div class="card-resource card-resource-plant"></div><div class="card-special card-slash">/</div><div class="card-resource card-resource-microbe"></div><div class="card-special card-slash">/</div><div class="card-resource card-resource-animal"></div></div>
    </template>
    <template v-else-if="id === 'Gp04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-plant"></div></div><div class="card-special card-slash">/</div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-animal"></div></div></div>
    </template>

    <!-- Kelvinists -->
    <template v-else-if="id === 'Kp01'">
      <div class="giga-policy__row"><div class="card-global-requirement card-temperature-global-requirement"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">3</div></div>
    </template>
    <template v-else-if="id === 'Kp02'">
      <div class="giga-policy__row">
        <div class="card-production-box"><div class="card-production-box-row"><div class="card-production-box-row-item"><div class="card-item-container"><div class="card-special card-minus"></div><span class="giga-policy__text giga-policy__text--dark">2</span><div class="card-resource card-resource-heat"></div></div></div></div></div>
        <div class="card-special card-red-arrow"></div><div class="card-tile card-tr"></div>
      </div>
    </template>
    <template v-else-if="id === 'Kp03'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">9</div><span class="red-arrow-infinity"></span>
        <div class="card-production-box"><div class="card-production-box-row"><div class="card-production-box-row-item"><div class="card-item-container"><div class="card-resource card-resource-heat"></div><div class="card-resource card-resource-heat"></div></div></div></div></div>
      </div>
    </template>
    <template v-else-if="id === 'Kp04'">
      <div class="giga-policy__row"><div class="card-tile empty-tile tile-size--M"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-heat"></div><div class="card-resource card-resource-heat"></div></div>
    </template>

    <!-- Mars First -->
    <template v-else-if="id === 'Mp01'">
      <div class="giga-policy__row"><div class="card-tile empty-tile tile-size--M"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-steel"></div></div>
    </template>
    <template v-else-if="id === 'Mp02'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">22</div><div class="card-superscript card-resource--superscript card-resource-steel"></div><span class="red-arrow-infinity"></span><div class="card-tile city-tile tile-size--M"></div></div>
    </template>
    <template v-else-if="id === 'Mp03'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-building"></div><div class="card-special card-slash">/</div><div class="card-resource-tag tag-mars"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">2</div></div>
    </template>
    <template v-else-if="id === 'Mp04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-building"></div></div><div class="card-special card-slash">/</div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-mars"></div></div></div>
    </template>

    <!-- SPOME -->
    <template v-else-if="id === 'Op01'">
      <div class="giga-policy__row"><div class="card-tile city-tile tile-size--M"></div><div class="card-special card-colon">:</div><div class="card-resource card-card"></div></div>
    </template>
    <template v-else-if="id === 'Op02'">
      <div class="giga-policy__row"><div class="card-tile card-tile-lunar-habitat tile-size--S"></div><div class="card-special card-slash">/</div><div class="card-tile card-tile-venus-habitat tile-size--S"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">4</div></div>
    </template>
    <template v-else-if="id === 'Op03'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">15</div><div class="card-superscript card-resource--superscript card-resource-titanium"></div><span class="red-arrow-infinity"></span><div class="card-resource-colony"></div></div>
    </template>

    <!-- Populists -->
    <template v-else-if="id === 'Pp01'">
      <div class="giga-policy__row"><div class="giga-policy__vp">X</div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">2X</div></div>
    </template>
    <template v-else-if="id === 'Pp03'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-event"></div><div class="card-special card-colon">:</div><div class="card-resource card-card"></div></div>
    </template>
    <template v-else-if="id === 'Pp04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-event"></div></div></div>
    </template>

    <!-- Reds -->
    <template v-else-if="id === 'Rp01'">
      <div class="giga-policy__row"><div class="card-tile card-tr"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">-3</div></div>
    </template>
    <template v-else-if="id === 'Rp02'">
      <div class="giga-policy__row"><div class="giga-policy__plate">Standard projects</div><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row"><div class="card-special card-minus"></div><div class="card-resource card-card"></div></div>
    </template>
    <template v-else-if="id === 'Rp03'">
      <div class="giga-policy__row"><div class="card-tile empty-tile tile-size--M"></div><div class="card-special card-colon">:</div><div class="card-resource card-resource-money">-3</div></div>
    </template>
    <template v-else-if="id === 'Rp04'">
      <div class="giga-policy__row"><div class="card-global-requirement card-ocean-global-requirement"></div><div class="card-global-requirement card-oxygen-global-requirement"></div><div class="card-global-requirement card-temperature-global-requirement"></div><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row">
        <div class="card-production-box"><div class="card-production-box-row"><div class="card-production-box-row-item"><div class="card-item-container"><div class="card-special card-minus"></div><div class="card-resource card-resource-money">1</div></div></div></div></div>
      </div>
    </template>

    <!-- Scientists -->
    <template v-else-if="id === 'Sp01'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-science"></div><div class="card-resource-tag tag-science"></div></div>
    </template>
    <template v-else-if="id === 'Sp02'">
      <div class="giga-policy__row"><div class="card-global-requirement card-temperature-global-requirement"></div><div class="card-global-requirement card-oxygen-global-requirement"></div><div class="card-global-requirement card-ocean-global-requirement"></div><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row"><span class="giga-policy__text giga-policy__text--big">± 2</span></div>
    </template>
    <template v-else-if="id === 'Sp03'">
      <div class="giga-policy__row"><div class="card-global-requirement card-ocean-global-requirement"></div><div class="card-global-requirement card-oxygen-global-requirement"></div><div class="card-global-requirement card-temperature-global-requirement"></div><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row"><div class="card-special card-plus"></div><div class="card-resource card-card"></div><div class="card-special card-minus"></div><div class="card-resource card-card"></div></div>
    </template>
    <template v-else-if="id === 'Sp04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-science"></div></div><div class="card-special card-slash">/</div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-req"></div></div></div>
    </template>

    <!-- Transhumanists -->
    <template v-else-if="id === 'Tp01'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-wild"></div></div>
    </template>
    <template v-else-if="id === 'Tp02'">
      <div class="giga-policy__row"><div class="giga-policy__plate">Standard projects</div><div class="card-special card-colon">:</div></div>
      <div class="giga-policy__row"><div class="card-resource card-resource-money">2</div></div>
    </template>

    <!-- Unity -->
    <template v-else-if="id === 'Up01'">
      <div class="giga-policy__row"><div class="card-resource card-resource-titanium"></div><div class="card-special card-colon">:</div><div class="card-special card-plus"></div><div class="card-resource card-resource-money">1</div></div>
    </template>
    <template v-else-if="id === 'Up02'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">10</div><div class="card-special card-red-arrow"></div><div class="card-resource-trade-fleet"></div></div>
    </template>
    <template v-else-if="id === 'Up03'">
      <div class="giga-policy__row"><div class="card-resource-tag tag-space"></div><div class="card-resource-tag tag-space"></div></div>
    </template>
    <template v-else-if="id === 'Up04'">
      <div class="giga-policy__row"><div class="card-resource card-resource-money">4</div><div class="card-special card-red-arrow"></div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-earth"></div></div><div class="card-special card-slash">/</div><div class="card-resource--has-secondary-tag card-card"><div class="card-icon tag-space"></div></div></div>
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

/** The policies drawn here. Every Giga Turmoil policy that's in the game has a layout. */
export const GIGA_POLICY_LAYOUTS: ReadonlySet<string> = new Set([
  'Bp01', 'Bp02', 'Bp03', 'Bp04', 'Cp01', 'Cp02', 'Cp03', 'Cp04', 'Ep01', 'Ep02', 'Ep03', 'Ep04',
  'Gp01', 'Gp02', 'Gp03', 'Gp04', 'Kp01', 'Kp02', 'Kp03', 'Kp04', 'Mp01', 'Mp02', 'Mp03', 'Mp04',
  'Op01', 'Op02', 'Op03', 'Pp01', 'Pp03', 'Pp04', 'Rp01', 'Rp02', 'Rp03', 'Rp04',
  'Sp01', 'Sp02', 'Sp03', 'Sp04', 'Tp01', 'Tp02', 'Up01', 'Up02', 'Up03', 'Up04',
]);

export default defineComponent({
  name: 'GigaPolicy',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="less">
.card-container.giga-policy {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 70px;
  zoom: 1;
  font-family: Prototype, sans-serif;
  color: #000;

  .giga-policy__row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }

  .card-colon {
    font-size: 22px;
    font-weight: bold;
    margin: 0 2px;
  }

  .card-slash {
    font-size: 20px;
  }

  .giga-policy__text {
    font-size: 20px;
    line-height: 1;
    white-space: nowrap;
  }

  .giga-policy__text--big {
    font-size: 26px;
  }

  .giga-policy__text--dark {
    color: #000;
    margin-right: 2px;
  }

  // Bureaucrats' first policy: the printed blue "ACTION" bar.
  .giga-policy__action-bar {
    padding: 1px 28px;
    border-radius: 2px;
    font-family: Ubuntu, sans-serif;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 1px;
    color: #1d2c5a;
    background: linear-gradient(#a8d7ff, #3c8de0);
    box-shadow: 0 0 0 1px #1d4f8a;
  }

  // "Standard projects", in the orange of the standard project cards.
  .giga-policy__plate {
    padding: 2px 10px;
    border-radius: 12px;
    font-family: Ubuntu, sans-serif;
    font-size: 13px;
    font-weight: bold;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
    color: #000;
    background: linear-gradient(#ffd56a, #f0a020);
    box-shadow: 0 0 0 1px #8a5a00, 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  // A tag you don't have yet: the rulebook's rainbow circle.
  .giga-policy__new-tag {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2fa83a, #f5e21b 50%, #e5312b);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6), inset -2px -3px 4px rgba(0, 0, 0, 0.25);
  }

  .giga-policy__new-tag--icon {
    width: 20px;
    height: 20px;
  }

  // A card's victory points, X of them.
  .giga-policy__vp {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 20px;
    line-height: 32px;
    text-align: center;
    color: #000;
    background: radial-gradient(circle at 40% 35%, #e3a46b, #8a4a22);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6);
  }

  // "Your lowest production": the printed white box with a "<".
  .giga-policy__lowest {
    display: inline-block;
    width: 24px;
    height: 24px;
    font-size: 22px;
    line-height: 24px;
    text-align: center;
    color: #000;
    background: #fff;
    border: 1px solid #000;
  }

  // Doesn't apply (Bureaucrats: not to the chairman).
  .giga-policy__cancelled {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      background:
        linear-gradient(45deg, transparent 45%, #d00 45%, #d00 55%, transparent 55%),
        linear-gradient(-45deg, transparent 45%, #d00 45%, #d00 55%, transparent 55%);
    }
  }
}
</style>
