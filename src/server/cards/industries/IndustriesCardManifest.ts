import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {
  EnergyIndustryStandardProject, HeatIndustryStandardProject, MoneyIndustryStandardProject,
  PlantIndustryStandardProject, RandomIndustryStandardProject, SteelIndustryStandardProject,
  TitaniumIndustryStandardProject,
} from './IndustryStandardProjects';

export const INDUSTRIES_CARD_MANIFEST = new ModuleManifest({
  module: 'industries',
  standardProjects: {
    [CardName.MONEY_INDUSTRY_STANDARD_PROJECT]: {Factory: MoneyIndustryStandardProject},
    [CardName.HEAT_INDUSTRY_STANDARD_PROJECT]: {Factory: HeatIndustryStandardProject},
    [CardName.ENERGY_INDUSTRY_STANDARD_PROJECT]: {Factory: EnergyIndustryStandardProject},
    [CardName.STEEL_INDUSTRY_STANDARD_PROJECT]: {Factory: SteelIndustryStandardProject},
    [CardName.PLANT_INDUSTRY_STANDARD_PROJECT]: {Factory: PlantIndustryStandardProject},
    [CardName.TITANIUM_INDUSTRY_STANDARD_PROJECT]: {Factory: TitaniumIndustryStandardProject},
    [CardName.RANDOM_INDUSTRY_STANDARD_PROJECT]: {Factory: RandomIndustryStandardProject},
  },
});
