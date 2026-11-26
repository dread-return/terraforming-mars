<template>
  <!--
    Drawn like the planetary and individual tracks: a dark row with the Delta Project badge on its left, each
    step's reward on top, its tag on a band in the middle, and the player cubes (with an outline for each free
    place) under it. The last two steps score 2 and 5 VP.
  -->
  <div class="delta-project-board">
    <div class="delta-project-board__title" v-i18n>Delta Project</div>
    <div class="delta-project-board__row">
      <div class="delta-project-board__badge"></div>
      <div class="delta-project-board__step delta-project-board__step--start">
        <div class="delta-project-board__reward"></div>
        <div class="delta-project-board__band"></div>
        <div class="delta-project-board__slots">
          <i
            v-for="color in playersAtPosition(0)"
            :key="color"
            :class="cubeCss(color)"
            class="delta-project-board__cube"
          ></i>
          <div
            v-for="n in emptySlotsStart"
            :key="'empty-start-' + n"
            class="delta-project-board__slot"
          ></div>
        </div>
      </div>
      <div
        v-for="(step, idx) in steps"
        :key="step.tag ?? 'vp-' + step.vpValue"
        class="delta-project-board__step"
        :class="{'delta-project-board__step--vp': step.vpValue !== undefined}"
      >
        <div class="delta-project-board__reward">
          <template v-for="(icon, i) in step.rewardIcons" :key="i">
            <span v-if="icon.or" class="delta-project-board__or">or</span>
            <span v-else-if="icon.separator" class="delta-project-board__separator">/</span>
            <div v-else-if="icon.production" class="delta-project-board__prod-box">
              <div v-for="n in (icon.count || 1)" :key="n" :class="icon.cssClass">{{ icon.text || '' }}</div>
            </div>
            <span v-else-if="icon.asterisk" class="delta-project-board__asterisk">*</span>
            <div v-else :class="icon.cssClass"></div>
          </template>
        </div>
        <div class="delta-project-board__band">
          <template v-if="step.vpValue">
            <span class="delta-project-board__vp">{{ step.vpValue }}</span>
            <span class="delta-project-board__vp-label">VP</span>
          </template>
          <div v-else class="resource-tag delta-project-board__tag" :class="'tag-' + step.tag"></div>
        </div>
        <div class="delta-project-board__slots">
          <i
            v-for="color in playersAtPosition(idx + 1)"
            :key="color"
            :class="cubeCss(color)"
            class="delta-project-board__cube"
          ></i>
          <div
            v-for="n in emptySlots(idx + 1, step)"
            :key="'empty-' + idx + '-' + n"
            class="delta-project-board__slot"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {Color} from '@/common/Color';
import {Tag} from '@/common/cards/Tag';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {DeltaBoardStep} from '@/client/components/delta/DeltaBoardStep';

const STEPS: ReadonlyArray<DeltaBoardStep> = [
  {
    tag: Tag.BUILDING,
    dynamicSlots: true,
    rewardIcons: [
      {cssClass: 'resource_icon resource_icon--steel'},
      {cssClass: 'resource_icon resource_icon--steel'},
      {cssClass: '', or: true},
      {cssClass: 'resource_icon resource_icon--plants'},
      {cssClass: 'resource_icon resource_icon--plants'},
    ],
  },
  {
    tag: Tag.POWER,
    dynamicSlots: true,
    rewardIcons: [
      {cssClass: 'resource_icon resource_icon--energy', production: true},
      {cssClass: '', or: true},
      {cssClass: 'resource_icon resource_icon--heat', production: true},
    ],
  },
  {
    tag: Tag.EARTH,
    dynamicSlots: true,
    rewardIcons: [
      {cssClass: 'resource megacredits', production: true, text: '2'},
    ],
  },
  {
    tag: Tag.SPACE,
    dynamicSlots: true,
    rewardIcons: [{cssClass: 'resource_icon resource_icon--titanium', production: true}],
  },
  {
    tag: Tag.SCIENCE,
    dynamicSlots: true,
    rewardIcons: [
      {cssClass: 'delta-project-board__card-icon'},
      {cssClass: 'delta-project-board__card-icon'},
      {cssClass: 'delta-project-board__card-icon delta-project-board__card-icon--discarded'},
      {cssClass: 'delta-project-board__card-icon delta-project-board__card-icon--discarded'},
    ],
  },
  {
    tag: Tag.PLANT,
    dynamicSlots: true,
    rewardIcons: [
      {cssClass: 'resource_icon resource_icon--plants'},
      {cssClass: '', separator: true},
      {cssClass: 'resource-tag tag-plant delta-project-board__reward-tag'},
    ],
  },
  {
    tag: Tag.MICROBE,
    dynamicSlots: true,
    rewardIcons: [{cssClass: 'red-arrow'}],
  },
  {
    tag: Tag.JOVIAN,
    dynamicSlots: true,
    rewardIcons: [{cssClass: 'resource-tag tag-jovian delta-project-board__reward-tag'}],
  },
  {
    tag: Tag.ANIMAL,
    dynamicSlots: true,
    rewardIcons: [
      {cssClass: 'resource animal'},
      {cssClass: 'resource animal'},
      {cssClass: '', asterisk: true},
    ],
  },
  {
    vpValue: 2,
    dynamicSlots: false,
    rewardIcons: [],
  },
  {
    vpValue: 5,
    dynamicSlots: false,
    rewardIcons: [],
  },
];

export default defineComponent({
  name: 'DeltaProjectBoard',
  props: {
    players: {
      type: Array as PropType<ReadonlyArray<PublicPlayerModel>>,
      required: true,
    },
  },
  data() {
    return {
      steps: STEPS,
    };
  },
  computed: {
    emptySlotsStart(): number {
      const occupied = this.playersAtPosition(0).length;
      return Math.max(0, this.players.length - occupied);
    },
  },
  methods: {
    cubeCss(color: Color): string {
      const css = 'board-cube board-cube--' + color;
      return getPreferences().symbol_overlay ? css + ' overlay' : css;
    },
    playersAtPosition(position: number): Array<Color> {
      const result: Array<Color> = [];
      for (const player of this.players) {
        if (player.deltaProject?.position === position) {
          result.push(player.color);
        }
      }
      return result;
    },
    emptySlots(position: number, step: DeltaBoardStep): number {
      const occupied = this.playersAtPosition(position).length;
      const minSlots = step.dynamicSlots ? this.players.length : 1;
      return Math.max(0, minSlots - occupied);
    },
  },
});
</script>

<style scoped lang="less">
.delta-project-board {
  margin: 20px;
  padding: 0 0 4px 44px;
  display: block;
  width: fit-content;
  max-width: calc(100% - 40px);
  box-sizing: border-box;
  overflow-x: auto;
  color: #e8e8e8;
}

.delta-project-board__title {
  font-family: Prototype, sans-serif;
  font-size: 18px;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 3px #000;
  margin: 0 0 10px -44px;
}

.delta-project-board__row {
  position: relative;
  display: flex;
  width: fit-content;
  padding-left: 46px;
  border-radius: 2px;
  background: linear-gradient(to right, #3c6670 0, #3a3a3a 140px, #2c2c2c);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

// The Delta Project chevron on a round badge, like the planetary tracks' tags.
.delta-project-board__badge {
  position: absolute;
  left: -30px;
  top: 50%;
  margin-top: -32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #000;
  box-shadow: 0 0 0 2px #888, 0 2px 6px #000;
  background: url(/assets/expansion_icons/expansion_icon_deltaProject.png) center / 44px no-repeat, radial-gradient(circle at 40% 35%, #4a4a4a, #151515);
}

.delta-project-board__step {
  min-width: 52px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.53));
  border-left: 2px solid rgba(0, 0, 0, 0.53);
}

.delta-project-board__step--start {
  min-width: 48px;
}

.delta-project-board__step--vp {
  min-width: 56px;
  background: linear-gradient(rgba(255, 204, 100, 0.12), rgba(0, 0, 0, 0.53));
}

.delta-project-board__reward {
  height: 50px;
  padding: 0 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.delta-project-board__band {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: linear-gradient(#4f8995, #2b5760);
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 1px solid rgba(0, 0, 0, 0.6);
  font-family: Prototype, sans-serif;
  color: #fff;
  text-shadow: 0 1px 2px #000;
}

.delta-project-board__step--start .delta-project-board__band {
  background: rgba(0, 0, 0, 0.35);
}

.delta-project-board__step--vp .delta-project-board__band {
  background: linear-gradient(#cc8b00, #805700);
  border-top-color: #ffd36a;
}

.delta-project-board__tag {
  width: 28px;
  height: 28px;
  background-size: 32px 32px;
  background-position: -2px -2px;
  filter: drop-shadow(0 1px 2px #000);
}

.delta-project-board__vp {
  font-size: 18px;
  text-shadow: 0 0 2px darkorange;
}

.delta-project-board__vp-label {
  font-size: 10px;
}

.delta-project-board__slots {
  min-height: 28px;
  box-sizing: border-box;
  padding: 4px 4px 3px;
  display: flex;
  flex-wrap: wrap;
  place-content: flex-start center;
  gap: 3px;
}

.delta-project-board__cube {
  position: relative;
  width: 20px;
  height: 20px;
  margin: 0;
  filter: drop-shadow(1px 2px 2px black);
}

.delta-project-board__cube::after {
  margin-left: 0 !important;
  margin-top: 0 !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// A free place on a step.
.delta-project-board__slot {
  width: 12px;
  height: 12px;
  margin: 4px;
  border-radius: 2px;
  border: 1px dashed rgba(255, 255, 255, 0.35);
}

.delta-project-board__separator {
  font-family: Prototype, sans-serif;
  font-size: 20px;
  margin: 0 1px;
}

.delta-project-board__or {
  font-family: Prototype, sans-serif;
  font-size: 13px;
  margin: 0 2px;
  text-transform: lowercase;
}

.delta-project-board__asterisk {
  font-family: Prototype, sans-serif;
  font-size: 16px;
  line-height: 1;
  align-self: flex-start;
  padding-top: 8px;
  color: #c5c5c5;
}

.delta-project-board__reward :deep(.resource_icon) {
  display: block;
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 1px 2px #000);
}

.delta-project-board__prod-box {
  display: inline-flex;
  flex-flow: row;
  align-items: center;
  padding: 3px;
  line-height: 0;
  border-top: 2px solid #ddd;
  border-left: 2px solid #ddd;
  border-bottom: 2px solid #898989;
  border-right: 2px solid #898989;
  background: url(/assets/misc/production.png) center / cover;
  filter: drop-shadow(0 1px 2px #000);
}

.delta-project-board__prod-box :deep(.resource_icon) {
  filter: none;
}

.delta-project-board__prod-box :deep(.resource) {
  margin: 0;
  width: 28px;
  height: 28px;
  background-size: 28px;
  line-height: 28px;
  font-size: 16px;
}

.delta-project-board__reward :deep(.resource.animal) {
  margin: 0;
  width: 28px;
  height: 28px;
  background-size: 28px;
}

.delta-project-board__reward-tag {
  width: 28px;
  height: 28px;
  background-size: 32px 32px;
  background-position: -2px -2px;
  box-shadow: none;
  filter: drop-shadow(0 1px 2px #000);
}

.delta-project-board__reward :deep(.red-arrow) {
  filter: drop-shadow(0 1px 2px #000);
}

.delta-project-board__card-icon {
  background: url(/assets/resources/card.png) no-repeat;
  background-size: 21px 28px;
  width: 21px;
  height: 28px;
  border-radius: 2px;
  filter: drop-shadow(0 1px 2px #000);
}

.delta-project-board__card-icon--discarded {
  opacity: 0.5;
}
</style>
