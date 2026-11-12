import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {SellPostludesStandardProject} from './SellPostludesStandardProject';
import {AstroUniversity} from './AstroUniversity';
import {CityProjectLibrary} from './CityProjectLibrary';
import {DeluxeWaterfrontResort} from './DeluxeWaterfrontResort';
import {FlightAcademy} from './FlightAcademy';
import {FoodProcessingUnit} from './FoodProcessingUnit';
import {InsuranceHQ} from './InsuranceHQ';
import {MachineryFactory} from './MachineryFactory';
import {MarsCasino} from './MarsCasino';
import {MarsHospital} from './MarsHospital';
import {MetallurgyWorkshop} from './MetallurgyWorkshop';
import {MineralRefinery} from './MineralRefinery';
import {MiningDepot} from './MiningDepot';
import {NanoParticleFacility} from './NanoParticleFacility';
import {PharmaceuticalCompany} from './PharmaceuticalCompany';
import {PowerConverter} from './PowerConverter';
import {ReDevelopmentOffice} from './ReDevelopmentOffice';
import {ScienceInstitute} from './ScienceInstitute';
import {BlackMarket} from './BlackMarket';
import {AmusementPark} from './AmusementPark';
import {AnimalFarm} from './AnimalFarm';
import {CultivationBiodome} from './CultivationBiodome';
import {PhotobionicPowerStation} from './PhotobionicPowerStation';
import {ProbioticsFacility} from './ProbioticsFacility';
import {UniversalBioStore} from './UniversalBioStore';
import {SoilEnrichmentLab} from './SoilEnrichmentLab';
import {WasteProcessingCentre} from './WasteProcessingCentre';
import {NationalGreenPark} from './NationalGreenPark';
import {AquaticLifeLaboratory} from './AquaticLifeLaboratory';
import {CloudGenerator} from './CloudGenerator';
import {DeepSeaMiningRig} from './DeepSeaMiningRig';
import {FloatingThermalPlant} from './FloatingThermalPlant';
import {HydraulicPowerPlant} from './HydraulicPowerPlant';
import {MarineAquarium} from './MarineAquarium';
import {MobileLaunchStation} from './MobileLaunchStation';
import {OceanGreenFarm} from './OceanGreenFarm';
import {OreRefinery} from './OreRefinery';
import {ResearchWatchtower} from './ResearchWatchtower';
import {SeaOrbiter} from './SeaOrbiter';
import {UnderwaterResort} from './UnderwaterResort';
import {SportDivingSchool} from './SportDivingSchool';
import {WaterRecycleComplex} from './WaterRecycleComplex';
import {SkyElevator} from './SkyElevator';

/**
 * Postludes, from the Terraforming Mars Epic / GIGA edition: special projects that upgrade a city, a greenery or an ocean.
 * They are project cards, but `GameCards` deals them from their own deck, not the project deck.
 */
export const POSTLUDES_CARD_MANIFEST = new ModuleManifest({
  module: 'postludes',
  projectCards: {
    [CardName.ASTRO_UNIVERSITY]: {Factory: AstroUniversity},
    [CardName.CITY_PROJECT_LIBRARY]: {Factory: CityProjectLibrary},
    [CardName.DELUXE_WATERFRONT_RESORT]: {Factory: DeluxeWaterfrontResort},
    [CardName.FLIGHT_ACADEMY]: {Factory: FlightAcademy},
    [CardName.FOOD_PROCESSING_UNIT]: {Factory: FoodProcessingUnit},
    [CardName.INSURANCE_HQ]: {Factory: InsuranceHQ},
    [CardName.MACHINERY_FACTORY]: {Factory: MachineryFactory},
    [CardName.MARS_CASINO]: {Factory: MarsCasino},
    [CardName.MARS_HOSPITAL]: {Factory: MarsHospital},
    [CardName.METALLURGY_WORKSHOP]: {Factory: MetallurgyWorkshop},
    [CardName.MINERAL_REFINERY]: {Factory: MineralRefinery},
    [CardName.MINING_DEPOT]: {Factory: MiningDepot},
    [CardName.NANO_PARTICLE_FACILITY]: {Factory: NanoParticleFacility},
    [CardName.PHARMACEUTICAL_COMPANY]: {Factory: PharmaceuticalCompany},
    [CardName.POWER_CONVERTER]: {Factory: PowerConverter},
    [CardName.RE_DEVELOPMENT_OFFICE]: {Factory: ReDevelopmentOffice},
    [CardName.SCIENCE_INSTITUTE]: {Factory: ScienceInstitute},
    [CardName.BLACK_MARKET]: {Factory: BlackMarket},
    [CardName.AMUSEMENT_PARK]: {Factory: AmusementPark},
    [CardName.ANIMAL_FARM]: {Factory: AnimalFarm},
    [CardName.CULTIVATION_BIODOME]: {Factory: CultivationBiodome},
    [CardName.PHOTOBIONIC_POWER_STATION]: {Factory: PhotobionicPowerStation},
    [CardName.PROBIOTICS_FACILITY]: {Factory: ProbioticsFacility},
    [CardName.UNIVERSAL_BIO_STORE]: {Factory: UniversalBioStore},
    [CardName.SOIL_ENRICHMENT_LAB]: {Factory: SoilEnrichmentLab},
    [CardName.WASTE_PROCESSING_CENTRE]: {Factory: WasteProcessingCentre},
    [CardName.NATIONAL_GREEN_PARK]: {Factory: NationalGreenPark},
    [CardName.AQUATIC_LIFE_LABORATORY]: {Factory: AquaticLifeLaboratory},
    [CardName.CLOUD_GENERATOR]: {Factory: CloudGenerator},
    [CardName.DEEP_SEA_MINING_RIG]: {Factory: DeepSeaMiningRig},
    [CardName.FLOATING_THERMAL_PLANT]: {Factory: FloatingThermalPlant},
    [CardName.HYDRAULIC_POWER_PLANT]: {Factory: HydraulicPowerPlant},
    [CardName.MARINE_AQUARIUM]: {Factory: MarineAquarium},
    [CardName.MOBILE_LAUNCH_STATION]: {Factory: MobileLaunchStation},
    [CardName.OCEAN_GREEN_FARM]: {Factory: OceanGreenFarm},
    [CardName.ORE_REFINERY]: {Factory: OreRefinery},
    [CardName.RESEARCH_WATCHTOWER]: {Factory: ResearchWatchtower},
    [CardName.SEA_ORBITER]: {Factory: SeaOrbiter},
    [CardName.UNDERWATER_RESORT]: {Factory: UnderwaterResort},
    [CardName.SPORT_DIVING_SCHOOL]: {Factory: SportDivingSchool},
    [CardName.WATER_RECYCLE_COMPLEX]: {Factory: WaterRecycleComplex},
    [CardName.SKY_ELEVATOR]: {Factory: SkyElevator},
  },
  standardProjects: {
    [CardName.SELL_POSTLUDES_STANDARD_PROJECT]: {Factory: SellPostludesStandardProject},
  },
});
