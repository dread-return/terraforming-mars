<template>
  <div class="sidebar_cont sidebar" :class="sideBarClass">
    <!-- Everything above the language/info/help/settings buttons, which are pinned to the bottom of the window.
         On a short window this part is shrunk just enough not to run into them (see fitTop). -->
    <div ref="top" class="sidebar_top">
      <div class="tm" :title="$t('Generation Marker')">
        <div class="gen-text" v-i18n>GEN</div>
        <div class="gen-marker">{{ genMarker }}</div>
      </div>
      <div v-if="gameOptions.expansions.turmoil" :title="$t('Ruling Party')">
        <div class="party-name party-name-indicator" :class="rulingPartyClass"> <span v-i18n>{{ rulingParty }}</span></div>
      </div>
      <div class="global_params">
        <GlobalParameterValue :param="globalParameter.TEMPERATURE" :value="temperature" :boardName="gameOptions.boardName" />
        <GlobalParameterValue :param="globalParameter.OXYGEN" :value="oxygen" :boardName="gameOptions.boardName" />
        <GlobalParameterValue :param="globalParameter.OCEANS" :value="oceans" :boardName="gameOptions.boardName" />
        <GlobalParameterValue v-if="gameOptions.expansions.venus" :param="globalParameter.VENUS" :value="venus" :boardName="gameOptions.boardName" :venusPhase2Track="gameOptions.expansions.venusphase2" />
        <MoonGlobalParameterValue v-if="moonData" :moonData="moonData" />
        <div v-if="contamination !== undefined" :title="contaminationTitle" data-test="contamination">
          <div class="contamination-tile"></div>
          <div class="global_params_value">{{ contamination }}</div>
        </div>
      </div>
      <div class="sidebar_item preferences_player" :title="$t('Player Color Cube')">
        <div class="preferences_player_inner" :class="[`player_bg_color_${playerColor}`, {active: isAnimated}]"></div>
      </div>

      <JumpMenu />
      <a href="#actions" :title="$t('Jump to actions')">
        <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--actions"></i>
        </div>
      </a>
      <a href="#cards" :title="$t('Jump to cards')">
        <div class="sidebar_item goto-cards sidebar_item_shortcut-long">
          <i class="sidebar_icon sidebar_icon--cards">
            <div class="deck-size">🂠{{ deckSize }}<br>🗑{{ discardPileSize }}</div>
          </i>
        </div>
      </a>
      <a v-if="coloniesCount > 0" href="#colonies" :title="$t('Jump to colonies')">
        <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--colonies"></i>
        </div>
      </a>
    </div>

    <LanguageIcon />

    <div class="sidebar_item sidebar_item--info" :title="$t('Information panel')">
      <i class="sidebar_icon sidebar_icon--info"
        :class="{'sidebar_item--is-active': ui.gamesetup_detail_open}"
        @click="ui.gamesetup_detail_open = !ui.gamesetup_detail_open"
        :title="$t('game setup details')"></i>
      <InfoPanel v-if="ui.gamesetup_detail_open" :gameOptions="gameOptions" :playerNumber="playerNumber" :lastSoloGeneration="lastSoloGeneration" :deckSize="deckSize" :discardPileSize="discardPileSize" :otherDeckSizes="otherDeckSizes" @close="ui.gamesetup_detail_open=false" />
    </div>

    <a href="help" target="_blank">
      <div class="sidebar_item sidebar_item--help">
        <i class="sidebar_icon sidebar_icon--help" :title="$t('player aid')"></i>
      </div>
    </a>

    <PreferencesIcon />
  </div>
</template>

<script lang="ts">
import {contaminationTrack, describeContaminationReward, nextContaminationReward} from '@/common/nuclear/Contamination';

import {defineComponent} from 'vue';
import {Color} from '@/common/Color';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {TurmoilModel} from '@/common/models/TurmoilModel';
import {PartyName} from '@/common/turmoil/PartyName';
import InfoPanel from '@/client/components/InfoPanel.vue';
import {GameOptionsModel} from '@/common/models/GameOptionsModel';
import {OtherDeckSizesModel} from '@/common/models/GameModel';
import GlobalParameterValue from '@/client/components/GlobalParameterValue.vue';
import MoonGlobalParameterValue from '@/client/components/moon/MoonGlobalParameterValue.vue';
import {GlobalParameter} from '@/common/GlobalParameter';
import {MoonModel} from '@/common/models/MoonModel';
import PreferencesIcon from '@/client/components/PreferencesIcon.vue';
import LanguageIcon from '@/client/components/LanguageIcon.vue';
import JumpMenu from '@/client/components/JumpMenu.vue';

const MIN_TOP_ZOOM = 0.6;

export default defineComponent({
  name: 'Sidebar',
  props: {
    playerNumber: {
      type: Number,
      required: true,
    },
    gameOptions: {
      type: Object as () => GameOptionsModel,
      required: true,
    },
    actingPlayer: {
      type: Boolean,
    },
    playerColor: {
      type: String as () => Color,
      required: true,
    },
    generation: {
      type: Number,
      required: true,
    },
    coloniesCount: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    oxygen: {
      type: Number,
      required: true,
    },
    oceans: {
      type: Number,
      required: true,
    },
    venus: {
      type: Number,
      required: true,
    },
    moonData: {
      type: Object as () => MoonModel | undefined,
    },
    // Nuclear (GIGA) contamination track; undefined when Nuclear is off.
    contamination: {
      type: Number as () => number | undefined,
      default: undefined,
    },
    turmoil: {
      type: Object as () => TurmoilModel | undefined,
    },
    lastSoloGeneration: {
      type: Number,
      required: true,
    },
    deckSize: {
      type: Number,
      required: true,
    },
    discardPileSize: {
      type: Number,
      required: true,
    },
    otherDeckSizes: {
      type: Object as () => OtherDeckSizesModel,
      required: true,
    },
  },
  components: {
    InfoPanel,
    GlobalParameterValue,
    MoonGlobalParameterValue,
    PreferencesIcon,
    LanguageIcon,
    JumpMenu,
  },
  mounted() {
    window.addEventListener('resize', this.fitTop);
    this.fitTop();
    document.fonts?.ready.then(() => this.fitTop());
  },
  updated() {
    this.fitTop();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.fitTop);
  },
  data() {
    return {
      'ui': {
        'gamesetup_detail_open': false,
      },
      'globalParameter': GlobalParameter,
    };
  },
  methods: {
    /**
     * With many expansions the global parameters, ruling party and shortcuts can be taller than a short window
     * leaves above the pinned buttons. Shrinks that part (down to 60%) so nothing overlaps.
     */
    fitTop(): void {
      const top = this.$refs.top as HTMLElement | undefined;
      const pinned = (this.$el as HTMLElement | undefined)?.querySelector?.('.sidebar_item--language');
      if (top === undefined || pinned === null || pinned === undefined) {
        return;
      }
      top.style.removeProperty('zoom');
      const natural = top.getBoundingClientRect();
      const room = pinned.getBoundingClientRect().top - natural.top - 6;
      if (natural.height <= 0 || natural.height <= room) {
        return;
      }
      top.style.setProperty('zoom', String(Math.max(MIN_TOP_ZOOM, room / natural.height)));
    },
  },
  computed: {
    contaminationTitle(): string {
      const level = this.contamination ?? 0;
      const track = contaminationTrack(this.gameOptions.altContaminationTrack);
      let title = `Contamination track: ${level}/${track.max}. Each Radioactive tag played moves it up 1.`;
      const next = nextContaminationReward(track, level);
      if (next !== undefined) {
        title += ` Step ${next.step}: ${describeContaminationReward(next.reward)}.`;
      }
      return title;
    },
    isAnimated(): boolean {
      return this.actingPlayer && getPreferences().hide_animated_sidebar === false;
    },
    sideBarClass(): string {
      return this.isAnimated ? 'preferences_acting_player' : 'preferences_nonacting_player';
    },
    genMarker(): string {
      return `${this.generation}`;
    },
    rulingPartyClass(): string | undefined {
      if (this.turmoil?.ruling === undefined) {
        console.warn('no party provided');
        return undefined;
      }
      return `party-name--${this.turmoil.ruling.toLowerCase().split(' ').join('_')}`;
    },
    rulingParty(): string {
      const ruling = this.turmoil?.ruling;
      switch (ruling) {
      case PartyName.MARS:
        return 'Mars';
      case PartyName.SCIENTISTS:
        return 'Science';
      case PartyName.KELVINISTS:
        return 'Kelvin';
      case PartyName.BUREAUCRATS:
        return 'Bureau.';
      case PartyName.POPULISTS:
        return 'Popul.';
      case PartyName.CENTRISTS:
        return 'Centr.';
      case PartyName.TRANSHUMANISTS:
        return 'Trans.';
      case undefined:
        return '???';
      default:
        return ruling;
      }
    },
  },
});

</script>
