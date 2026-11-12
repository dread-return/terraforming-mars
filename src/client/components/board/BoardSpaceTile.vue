<template>
  <div :class="klass" :title="$t(description)" data-test="tile">
    <AdjacencyBonus v-if="aresExtension && tileType !== undefined" :tileType="tileType" />
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {SpaceType} from '@/common/boards/SpaceType';
import {TileType, tileTypeToString} from '@/common/TileType';
import {SpaceHighlight, SpaceModel} from '@/common/models/SpaceModel';
import {TileView} from '@/client/components/board/TileView';
import AdjacencyBonus from '@/client/components/AdjacencyBonus.vue';

const tileTypeToCssClass: Record<TileType, string> = {
  [TileType.OCEAN]: 'ocean',
  [TileType.CITY]: 'city',
  [TileType.GREENERY]: 'greenery',
  [TileType.COMMERCIAL_DISTRICT]: 'commercial_district',
  [TileType.ECOLOGICAL_ZONE]: 'ecological_zone',
  [TileType.INDUSTRIAL_CENTER]: 'industrial_center',
  [TileType.LAVA_FLOWS]: 'lava_flows',
  [TileType.MINING_AREA]: 'mining_area',
  [TileType.MINING_RIGHTS]: 'mining_rights',
  [TileType.CAPITAL]: 'capital',
  [TileType.MOHOLE_AREA]: 'mohole_area',
  [TileType.NATURAL_PRESERVE]: 'natural_preserve',
  [TileType.NUCLEAR_ZONE]: 'nuclear_zone',
  [TileType.RESTRICTED_AREA]: 'restricted_area',
  [TileType.DEIMOS_DOWN]: 'deimos_down',
  [TileType.GREAT_DAM]: 'great_dam',
  [TileType.MAGNETIC_FIELD_GENERATORS]: 'magnetic_field_generators',
  [TileType.BIOFERTILIZER_FACILITY]: 'biofertilizer-facility',
  [TileType.METALLIC_ASTEROID]: 'metallic-asteroid',
  [TileType.SOLAR_FARM]: 'solar-farm',
  [TileType.OCEAN_CITY]: 'ocean-city',
  [TileType.OCEAN_FARM]: 'ocean-farm',
  [TileType.OCEAN_SANCTUARY]: 'ocean-sanctuary',
  [TileType.DUST_STORM_MILD]: 'dust-storm-mild',
  [TileType.DUST_STORM_SEVERE]: 'dust-storm-severe',
  [TileType.EROSION_MILD]: 'erosion-mild',
  [TileType.EROSION_SEVERE]: 'erosion-severe',
  [TileType.MINING_STEEL_BONUS]: 'mining-steel',
  [TileType.MINING_TITANIUM_BONUS]: 'mining-titanium',
  [TileType.WETLANDS]: 'wetlands',
  [TileType.RED_CITY]: 'red-city',
  [TileType._DEPRECATED_MARTIAN_NATURE_WONDERS]: '',
  [TileType.MOON_ROAD]: 'road',
  [TileType.MOON_HABITAT]: 'habitat',
  [TileType.MOON_MINE]: 'mine',
  [TileType.LUNA_TRADE_STATION]: 'luna-trade-station',
  [TileType.LUNA_MINING_HUB]: 'luna-mining-hub',
  [TileType.LUNA_TRAIN_STATION]: 'luna-train-station',
  [TileType.LUNAR_MINE_URBANIZATION]: 'lunar-mine-urbanization',
  [TileType.CRASHLANDING]: 'crashlanding',
  [TileType.MARS_NOMADS]: '', // This never actually renders.
  [TileType._DEPRECATED_REY_SKYWALKER]: '',
  [TileType.MAN_MADE_VOLCANO]: 'man-made-volcano',
  [TileType.NEW_HOLLAND]: 'new-holland',
  [TileType.NEURAL_INSTANCE]: 'neural-instance',
  [TileType.SUBURBS]: 'ra-suburbs',
  [TileType.HARBOR]: 'ra-harbor',
  [TileType.METROPOLIS]: 'ra-metropolis',
  [TileType.PARADISE_CITY]: 'ra-paradise',
  [TileType.ANIMAL_DOME]: 'ra-animal-dome',
  [TileType.PUMPING_HUB]: 'ra-pumping-hub',
  [TileType.SEDIMENT]: 'ra-sediment',
  [TileType.INVAK_CITY]: 'im-invak-city',
  [TileType.EVACUATION_ZONE]: 'nu-evacuation-zone',
  [TileType.RADIOACTIVE_DEFLUX]: 'nu-radioactive-deflux',
  [TileType.ESOTERIC_COMMUNITY]: 'nu-esoteric-community',
  [TileType.VENUS_FLOATING_ARRAY]: 'venus-floating-array',
  [TileType.VENUS_GAS_MINE]: 'venus-gas-mine',
  [TileType.VENUS_HABITAT]: 'venus-habitat',
  [TileType.MENAGERIE]: 'vp-menagerie',
  [TileType.FLOWSTONE_CAVE]: 'et-flowstone-cave',
  [TileType.GLACIER]: 'et-glacier',
  [TileType.GROUND_ZERO]: 'et-ground-zero',
  [TileType.INDUSTRY_MONEY]: 'industry-money',
  [TileType.INDUSTRY_HEAT]: 'industry-heat',
  [TileType.INDUSTRY_ENERGY]: 'industry-energy',
  [TileType.INDUSTRY_STEEL]: 'industry-steel',
  [TileType.INDUSTRY_PLANT]: 'industry-plant',
  [TileType.INDUSTRY_TITANIUM]: 'industry-titanium',
  [TileType.INDUSTRY_RANDOM]: 'industry-random',
};

const tileTypeToCssClassAresOverride = new Map<TileType, string>([
  [TileType.COMMERCIAL_DISTRICT, 'commercial-district-ares'],
  [TileType.DEIMOS_DOWN, 'deimos-down-ares'],
  [TileType.ECOLOGICAL_ZONE, 'ecological-zone-ares'],
  [TileType.GREAT_DAM, 'great-dam-ares'],
  [TileType.INDUSTRIAL_CENTER, 'industrial-center-ares'],
  [TileType.LAVA_FLOWS, 'lava-flows-ares'],
  [TileType.CAPITAL, 'capital-ares'],
  [TileType.MOHOLE_AREA, 'mohole-area-ares'],
  [TileType.NATURAL_PRESERVE, 'natural-preserve-ares'],
  [TileType.NUCLEAR_ZONE, 'nuclear-zone-ares'],
  [TileType.RESTRICTED_AREA, 'restricted-area-ares'],
  [TileType.MAGNETIC_FIELD_GENERATORS, 'magnetic-field-generators-ares'],
]);

const descriptions: Record<TileType, string> = {
  ...tileTypeToString,
  [TileType.COMMERCIAL_DISTRICT]: 'Commercial District: 1 VP per adjacent city tile',
  [TileType.CITY]: 'City: 1 VP per adjacent greenery',
  [TileType.GREENERY]: 'Greenery: 1 VP',
  [TileType.OCEAN]: 'Ocean: grants 2M€ when players put tiles next to it',
  [TileType.OCEAN_CITY]: 'Ocean City: counts as an ocean and a city.',
  [TileType.DUST_STORM_MILD]: 'Mild Dust Storm: lose 1 production when placing next to it. Pay 8M€ to place over it.',
  [TileType.DUST_STORM_SEVERE]: 'Severe Dust Storm: lose 2 production when placing next to it. Pay 16M€ to place over it.',
  [TileType.EROSION_MILD]: 'Mild Erosion: lose 1 production when placing next to it. Pay 8M€ to place over it.',
  [TileType.EROSION_SEVERE]: 'Severe Erosion: lose 2 production when placing next to it. Pay 16M€ to place over it.',
  [TileType.MINING_STEEL_BONUS]: 'Mining: steel bonus',
  [TileType.MINING_TITANIUM_BONUS]: 'Mining: titanium bonus',
  [TileType.MOON_MINE]: 'Moon Mine: 1 VP per adjacent road',
  [TileType.MOON_HABITAT]: 'Moon Habitat: 1 VP per adjacent road',
  [TileType.MOON_ROAD]: 'Moon Road: 1 VP',
  [TileType.LUNA_TRAIN_STATION]: 'Luna Train Station: 2 VP per adjacent road',
  [TileType.LUNAR_MINE_URBANIZATION]: 'Luna Mine Urbanization: counts as both a colony and a mine tile.',

  [TileType.WETLANDS]: 'Wetlands: counts as an ocean and a greenery. Does not count toward 9 oceans.',
  [TileType.RED_CITY]: 'Red City: 1 VP per empty adjacent area. No greeneries may be placed next to it.',
  [TileType.NEW_HOLLAND]: 'New Holland: counts as an ocean and a city',
  [TileType.NEURAL_INSTANCE]: 'Neural Instance: MarsBot gains VP for adjacent non-human spaces',
  [TileType.SUBURBS]: 'Suburbs: counts as a city. Adjacency bonus: 1 M€.',
  [TileType.HARBOR]: 'Harbor: counts as an ocean. Adjacency bonus: 1 steel.',
  [TileType.METROPOLIS]: 'Metropolis: counts as a city. Adjacency bonus: 1 steel.',
  [TileType.PARADISE_CITY]: 'Paradise City: counts as a city. Adjacency bonus: 1 M€.',
  [TileType.ANIMAL_DOME]: 'Animal Dome. Adjacency bonus: 1 animal.',
  [TileType.PUMPING_HUB]: 'Pumping Hub. Adjacency bonus: 2 energy.',
  [TileType.INVAK_CITY]: 'Invak City: counts as a city and as a greenery. Adjacency bonus: 2 M€.',
  [TileType.EVACUATION_ZONE]: 'Evacuation Zone. Placing a tile next to it costs 1 plant and 1 microbe.',
  [TileType.RADIOACTIVE_DEFLUX]: 'Radioactive Deflux. Placing a tile next to it costs 1 animal.',
  [TileType.ESOTERIC_COMMUNITY]: 'Esoteric Community: counts as a city. 1 VP per adjacent special tile. Adjacency bonus: 2 M€.',
  [TileType.VENUS_FLOATING_ARRAY]: 'Floating Array: 1 VP for each adjacent Venus Habitat, Gas Mine or city.',
  [TileType.VENUS_GAS_MINE]: 'Gas Mine: 1 VP per adjacent Floating Array',
  [TileType.VENUS_HABITAT]: 'Venus Habitat: 1 VP per adjacent Floating Array',
  [TileType.MENAGERIE]: 'Menagerie. Adjacency bonus: 1 animal.',
  [TileType.FLOWSTONE_CAVE]: 'Flowstone Cave',
  [TileType.GLACIER]: 'Thawing Glacier: becomes an ocean when the temperature is maxed.',
  [TileType.GROUND_ZERO]: 'Ground Zero',
  [TileType.INDUSTRY_MONEY]: 'Industry: raised your M€ production. No adjacency bonus.',
  [TileType.INDUSTRY_HEAT]: 'Industry: raised your heat production. No adjacency bonus.',
  [TileType.INDUSTRY_ENERGY]: 'Industry: raised your energy production. No adjacency bonus.',
  [TileType.INDUSTRY_STEEL]: 'Industry: raised your steel production. No adjacency bonus.',
  [TileType.INDUSTRY_PLANT]: 'Industry: raised your plant production. No adjacency bonus.',
  [TileType.INDUSTRY_TITANIUM]: 'Industry: raised your titanium production. No adjacency bonus.',
  [TileType.INDUSTRY_RANDOM]: 'Industry: raised a production of its owner\'s choice. No adjacency bonus.',
  [TileType.SEDIMENT]: 'Sediment: any player may place a city here, ignoring placement rules, and gain 3 M€. Adjacency bonus: 1 titanium.',
};

export default defineComponent({
  name: 'BoardSpaceTile',
  props: {
    space: {
      type: Object as () => SpaceModel,
      required: true,
    },
    aresExtension: {
      type: Boolean,
    },
    // Nuclear (GIGA): Nuclear Zones carry the Ares -2 M€ adjacency malus.
    nuclearExpansion: {
      type: Boolean,
    },
    tileView: {
      type: String as () => TileView,
      default: 'show',
    },
  },
  components: {
    AdjacencyBonus,
  },
  computed: {
    tileType(): TileType | undefined {
      return this.space.tileType;
    },
    spaceType(): SpaceType {
      return this.space.spaceType;
    },
    highlight(): SpaceHighlight {
      return this.space.highlight;
    },
    isSpaceCity(): boolean {
      if (this.tileType !== TileType.CITY) {
        return false;
      }
      // Colony spaces are the off-world city spaces; ids starting with 'v' are the Venus Phase 2 map.
      return this.spaceType === SpaceType.COLONY || this.space.id.startsWith('v');
    },
    description(): string {
      if (this.tileType === undefined) {
        return '';
      }
      if (this.isSpaceCity) {
        return 'City in space.';
      }
      return descriptions[this.tileType];
    },
    klass(): string {
      let css = 'board-space';
      if (this.tileType !== undefined) {
        let cssClass: string | undefined = tileTypeToCssClass[this.tileType];
        if ((this.aresExtension || (this.nuclearExpansion && this.tileType === TileType.NUCLEAR_ZONE)) && tileTypeToCssClassAresOverride.has(this.tileType)) {
          cssClass = tileTypeToCssClassAresOverride.get(this.tileType);
        }
        if (this.isSpaceCity) {
          cssClass = 'space-city';
        }
        // Special case Crashlanding rotation
        if (this.tileType === TileType.CRASHLANDING && this.space.rotated === true) {
          cssClass += '-rotated';
        }
        css += ' board-space-tile--' + cssClass;
      } else {
        switch (this.spaceType) {
        case SpaceType.OCEAN:
          css += ' board-space-type-ocean';
          break;
        case SpaceType.COVE:
          if (this.highlight !== 'volcanic') {
            // Custom for Arabia Terra's space Tikhonarov.
            css += ' board-space-type-cove';
          } else {
            css += ' board-space-type-volcanic-cove';
          }
          break;
        case SpaceType.RESTRICTED:
          break;
        default:
          css += ' board-space-type-land';

          if (this.highlight) {
            css += ` board-space-type-land-${this.highlight}`;
          }
        }
      }
      if (this.tileView !== 'show') {
        css += ' board-hidden-tile';
      }
      return css;
    },
  },
});

</script>
