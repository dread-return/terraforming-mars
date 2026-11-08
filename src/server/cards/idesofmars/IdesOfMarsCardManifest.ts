import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {BudgetRestrictions} from './BudgetRestrictions';
import {PreciousMetalAsteroid} from './PreciousMetalAsteroid';
import {TargetedResearch} from './TargetedResearch';
import {ScienceFair} from './ScienceFair';
import {PatentTheft} from './PatentTheft';
import {MuseumOfTerraformation} from './MuseumOfTerraformation';
import {IndustrialSpy} from './IndustrialSpy';
import {FloatingBaseOnSaturn} from './FloatingBaseOnSaturn';
import {BudgetManagement} from './BudgetManagement';
import {PlotContamination} from './PlotContamination';
import {MartianHour} from './MartianHour';
import {CollaborationCrossCompanies} from './CollaborationCrossCompanies';
import {ThreePlanetsSystem} from './ThreePlanetsSystem';
import {Copyleft} from './Copyleft';
import {AdministrativeDelay} from './AdministrativeDelay';
import {InsectPollinators} from './InsectPollinators';
import {NewFrontier} from './NewFrontier';
import {SmallDeposit} from './SmallDeposit';
import {CorporateAcquisition} from './CorporateAcquisition';
import {InvestmentInsurance} from './InvestmentInsurance';
import {ColonyScrapping} from './ColonyScrapping';
import {PatentPooling} from './PatentPooling';
import {Backstabbing} from './Backstabbing';
import {PublicRelations} from './PublicRelations';
import {AppliedResearch} from './AppliedResearch';
import {SpacePirates} from './SpacePirates';
import {MartianInfrastructures} from './MartianInfrastructures';
import {FlyingCorsairs} from './FlyingCorsairs';
import {HiddenCity} from './HiddenCity';
import {BioBatteries} from './BioBatteries';
import {InvakCity} from './InvakCity';
import {DragonStorm} from './DragonStorm';
import {GalileianTourism} from './GalileianTourism';
import {Troglobites} from './Troglobites';
import {Amphibians} from './Amphibians';
import {SolarSenate} from './SolarSenate';
import {VenusianGroundLaboratory} from './VenusianGroundLaboratory';
import {DarkVegetation} from './DarkVegetation';
import {MartianStockExchange} from './MartianStockExchange';
import {DerivedProducts} from './DerivedProducts';
import {FloatingRig} from './FloatingRig';
import {EnergyShortcut} from './EnergyShortcut';
import {AirTransportCompany} from './AirTransportCompany';
import {GreatLeapForward} from './GreatLeapForward';
import {WaterCleaningBacteria} from './WaterCleaningBacteria';
import {OverconsumptionBenefits} from './OverconsumptionBenefits';
import {MercurialLaboratory} from './MercurialLaboratory';
import {InVivoTesting} from './InVivoTesting';
import {WaterRetainers} from './WaterRetainers';
import {Slum} from './Slum';
import {BlueMars} from './BlueMars';
import {MiningTheBelt} from './MiningTheBelt';
import {Takeover} from './Takeover';
import {Infrastructures} from './Infrastructures';
import {NaturalGrowthCatalyst} from './NaturalGrowthCatalyst';
import {GalaxyExpress} from './GalaxyExpress';
import {PleistoceneMegafauna} from './PleistoceneMegafauna';
import {Reptiles} from './Reptiles';
import {ObjectiveMars} from './ObjectiveMars';
import {GalileoInstitute} from './GalileoInstitute';
import {UniversalFighters} from './UniversalFighters';

/**
 * Ides of Mars, as reworked for the Terraforming Mars GIGA Expansion.
 * https://boardgamegeek.com/thread/2293920/terraforming-mars-giga-expansion-ares-pathfinder-b
 *
 * Card numbers follow the card image files (several printed codes are duplicated).
 * Numbers 11, 32, 34 and 51 don't exist in this edition.
 * Not included yet: the 3 cards that need the GIGA Turmoil parties or the GIGA board
 * (I26 Flying Garden, I30 Terraforming Office, I40 Free City).
 */
export const IDES_OF_MARS_CARD_MANIFEST = new ModuleManifest({
  module: 'idesofmars',
  projectCards: {
    [CardName.BUDGET_RESTRICTIONS]: {Factory: BudgetRestrictions},
    [CardName.PRECIOUS_METAL_ASTEROID]: {Factory: PreciousMetalAsteroid},
    [CardName.TARGETED_RESEARCH]: {Factory: TargetedResearch},
    [CardName.SCIENCE_FAIR]: {Factory: ScienceFair},
    [CardName.PATENT_THEFT]: {Factory: PatentTheft},
    [CardName.MUSEUM_OF_TERRAFORMATION]: {Factory: MuseumOfTerraformation},
    [CardName.INDUSTRIAL_SPY]: {Factory: IndustrialSpy},
    [CardName.FLOATING_BASE_ON_SATURN]: {Factory: FloatingBaseOnSaturn},
    [CardName.BUDGET_MANAGEMENT]: {Factory: BudgetManagement},
    [CardName.PLOT_CONTAMINATION]: {Factory: PlotContamination},
    [CardName.MARTIAN_HOUR]: {Factory: MartianHour},
    [CardName.COLLABORATION_CROSS_COMPANIES]: {Factory: CollaborationCrossCompanies},
    [CardName.THREE_PLANETS_SYSTEM]: {Factory: ThreePlanetsSystem, compatibility: 'venus'},
    [CardName.COPYLEFT]: {Factory: Copyleft},
    [CardName.ADMINISTRATIVE_DELAY]: {Factory: AdministrativeDelay},
    [CardName.INSECT_POLLINATORS]: {Factory: InsectPollinators},
    [CardName.NEW_FRONTIER]: {Factory: NewFrontier, compatibility: 'colonies'},
    [CardName.SMALL_DEPOSIT]: {Factory: SmallDeposit},
    [CardName.CORPORATE_ACQUISITION]: {Factory: CorporateAcquisition},
    [CardName.INVESTMENT_INSURANCE]: {Factory: InvestmentInsurance},
    [CardName.COLONY_SCRAPPING]: {Factory: ColonyScrapping, compatibility: 'colonies'},
    [CardName.PATENT_POOLING]: {Factory: PatentPooling},
    [CardName.BACKSTABBING]: {Factory: Backstabbing, compatibility: 'turmoil'},
    [CardName.PUBLIC_RELATIONS]: {Factory: PublicRelations},
    [CardName.APPLIED_RESEARCH]: {Factory: AppliedResearch},
    [CardName.SPACE_PIRATES]: {Factory: SpacePirates, compatibility: 'colonies'},
    [CardName.MARTIAN_INFRASTRUCTURES]: {Factory: MartianInfrastructures},
    [CardName.FLYING_CORSAIRS]: {Factory: FlyingCorsairs},
    [CardName.HIDDEN_CITY]: {Factory: HiddenCity},
    [CardName.BIO_BATTERIES]: {Factory: BioBatteries},
    [CardName.INVAK_CITY]: {Factory: InvakCity},
    [CardName.DRAGON_STORM]: {Factory: DragonStorm},
    [CardName.GALILEIAN_TOURISM]: {Factory: GalileianTourism},
    [CardName.TROGLOBITES]: {Factory: Troglobites},
    [CardName.AMPHIBIANS]: {Factory: Amphibians},
    [CardName.SOLAR_SENATE]: {Factory: SolarSenate, compatibility: ['colonies', 'turmoil']},
    [CardName.VENUSIAN_GROUND_LABORATORY]: {Factory: VenusianGroundLaboratory, compatibility: 'venus'},
    [CardName.DARK_VEGETATION]: {Factory: DarkVegetation},
    [CardName.MARTIAN_STOCK_EXCHANGE]: {Factory: MartianStockExchange, compatibility: 'colonies'},
    [CardName.DERIVED_PRODUCTS]: {Factory: DerivedProducts},
    [CardName.FLOATING_RIG]: {Factory: FloatingRig, compatibility: 'venus'},
    [CardName.ENERGY_SHORTCUT]: {Factory: EnergyShortcut},
    [CardName.AIR_TRANSPORT_COMPANY]: {Factory: AirTransportCompany, compatibility: 'venus'},
    [CardName.GREAT_LEAP_FORWARD]: {Factory: GreatLeapForward, compatibility: 'turmoil'},
    [CardName.WATER_CLEANING_BACTERIA]: {Factory: WaterCleaningBacteria},
    [CardName.OVERCONSUMPTION_BENEFITS]: {Factory: OverconsumptionBenefits},
    // Held out of the deck until the GIGA Mercury module is added (Leo, 2026-11-08).
    [CardName.MERCURIAL_LABORATORY]: {Factory: MercurialLaboratory, instantiate: false},
    [CardName.IN_VIVO_TESTING]: {Factory: InVivoTesting},
    [CardName.WATER_RETAINERS]: {Factory: WaterRetainers},
    [CardName.SLUM]: {Factory: Slum},
    [CardName.BLUE_MARS]: {Factory: BlueMars},
    [CardName.MINING_THE_BELT]: {Factory: MiningTheBelt},
    [CardName.TAKEOVER]: {Factory: Takeover},
    [CardName.INFRASTRUCTURES]: {Factory: Infrastructures},
    [CardName.NATURAL_GROWTH_CATALYST]: {Factory: NaturalGrowthCatalyst},
    [CardName.GALAXY_EXPRESS]: {Factory: GalaxyExpress, compatibility: 'colonies'},
    [CardName.PLEISTOCENE_MEGAFAUNA]: {Factory: PleistoceneMegafauna},
    [CardName.REPTILES]: {Factory: Reptiles},
    [CardName.OBJECTIVE_MARS]: {Factory: ObjectiveMars},
    [CardName.GALILEO_INSTITUTE]: {Factory: GalileoInstitute},
    [CardName.UNIVERSAL_FIGHTERS]: {Factory: UniversalFighters},
  },
});
