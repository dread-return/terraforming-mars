import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {BionicAugmentations} from './BionicAugmentations';
import {SyntheticBrainCells} from './SyntheticBrainCells';
import {BuildingDeregulation} from './BuildingDeregulation';
import {PowerLinesHub} from './PowerLinesHub';
import {Plebiscite} from './Plebiscite';
import {RedistributionOfWealth} from './RedistributionOfWealth';
import {Cyborgs} from './Cyborgs';
import {StrongArtificialIntelligence} from './StrongArtificialIntelligence';
import {ColdFusionTechnology} from './ColdFusionTechnology';
import {MartianAgriculture} from './MartianAgriculture';
import {ManagementCrisis} from './ManagementCrisis';
import {EnergyAcquisition} from './EnergyAcquisition';
import {MartianCensus} from './MartianCensus';
import {WanderingStationHermes} from './WanderingStationHermes';
import {FirstManMonument} from './FirstManMonument';
import {AwardCelebration} from './AwardCelebration';
import {Bribery} from './Bribery';
import {MarsAcademyOfPoliticalSciences} from './MarsAcademyOfPoliticalSciences';
import {ImmigrationBureau} from './ImmigrationBureau';
import {AntiFraudInvestigation} from './AntiFraudInvestigation';
import {Omegalaxy} from './Omegalaxy';
import {AtmosphericCompressor} from './AtmosphericCompressor';
import {OrbitalHydrogeologicCannon} from './OrbitalHydrogeologicCannon';
import {ExtraplanetaryUrbanizator} from './ExtraplanetaryUrbanizator';
import {EinsteinRosenGateway} from './EinsteinRosenGateway';
import {PlanetaryCoreInductor} from './PlanetaryCoreInductor';
import {SyntheticGargantuaTrees} from './SyntheticGargantuaTrees';
import {ArtificialMoon} from './ArtificialMoon';
import {SpaceTelescope} from './SpaceTelescope';
import {Flagship} from './Flagship';
import {Sideralis} from './Sideralis';
import {Stellatron} from './Stellatron';
import {CondensationPlant} from './CondensationPlant';
import {WasteIncinerator} from './WasteIncinerator';
import {StellarEngine} from './StellarEngine';
import {GiantIndustrialComplex} from './GiantIndustrialComplex';
import {TradeAgreements} from './TradeAgreements';
import {WishMachine} from './WishMachine';
import {CompanyNationalization} from './CompanyNationalization';
import {TerrainLease} from './TerrainLease';
import {SynergisticForests} from './SynergisticForests';
import {AceVeteranSquad} from './AceVeteranSquad';
import {GalaxyDefenders} from './GalaxyDefenders';
import {Mothership} from './Mothership';
import {HypersonicFighters} from './HypersonicFighters';
import {ShieldingDrones} from './ShieldingDrones';

/**
 * Solaris, as reworked for the Terraforming Mars GIGA Expansion.
 * https://boardgamegeek.com/thread/2293920/terraforming-mars-giga-expansion-ares-pathfinder-b
 *
 * S01 Self-Replicating Robots is the official promo card; GameCards adds it to the deck when Solaris is on.
 * Not included yet: the 20 cards that need the GIGA Turmoil parties
 * (S13–S16, S19, S21–S24, S26, S29–S31, S35–S41).
 */
export const SOLARIS_CARD_MANIFEST = new ModuleManifest({
  module: 'solaris',
  corporationCards: {
    [CardName.OMEGALAXY]: {Factory: Omegalaxy},
  },
  projectCards: {
    [CardName.ATMOSPHERIC_COMPRESSOR]: {Factory: AtmosphericCompressor},
    [CardName.ORBITAL_HYDROGEOLOGIC_CANNON]: {Factory: OrbitalHydrogeologicCannon},
    [CardName.EXTRAPLANETARY_URBANIZATOR]: {Factory: ExtraplanetaryUrbanizator},
    [CardName.EINSTEIN_ROSEN_GATEWAY]: {Factory: EinsteinRosenGateway, compatibility: 'colonies'},
    [CardName.PLANETARY_CORE_INDUCTOR]: {Factory: PlanetaryCoreInductor},
    [CardName.SYNTHETIC_GARGANTUA_TREES]: {Factory: SyntheticGargantuaTrees},
    [CardName.ARTIFICIAL_MOON]: {Factory: ArtificialMoon},
    [CardName.SPACE_TELESCOPE]: {Factory: SpaceTelescope},
    [CardName.FLAGSHIP]: {Factory: Flagship},
    [CardName.SIDERALIS]: {Factory: Sideralis},
    [CardName.STELLATRON]: {Factory: Stellatron, compatibility: 'venus'},
    [CardName.CONDENSATION_PLANT]: {Factory: CondensationPlant, compatibility: 'turmoil'},
    [CardName.WASTE_INCINERATOR]: {Factory: WasteIncinerator, compatibility: 'turmoil'},
    [CardName.STELLAR_ENGINE]: {Factory: StellarEngine},
    [CardName.GIANT_INDUSTRIAL_COMPLEX]: {Factory: GiantIndustrialComplex, compatibility: 'turmoil'},
    [CardName.TRADE_AGREEMENTS]: {Factory: TradeAgreements, compatibility: ['turmoil', 'colonies']},
    [CardName.WISH_MACHINE]: {Factory: WishMachine, compatibility: 'turmoil'},
    [CardName.COMPANY_NATIONALIZATION]: {Factory: CompanyNationalization, compatibility: 'turmoil'},
    [CardName.TERRAIN_LEASE]: {Factory: TerrainLease, compatibility: 'turmoil'},
    [CardName.SYNERGISTIC_FORESTS]: {Factory: SynergisticForests, compatibility: 'turmoil'},
    [CardName.ACE_VETERAN_SQUAD]: {Factory: AceVeteranSquad},
    [CardName.GALAXY_DEFENDERS]: {Factory: GalaxyDefenders},
    [CardName.MOTHERSHIP]: {Factory: Mothership},
    [CardName.HYPERSONIC_FIGHTERS]: {Factory: HypersonicFighters},
    [CardName.SHIELDING_DRONES]: {Factory: ShieldingDrones},
    // Need a GIGA fan party, so only in Giga Turmoil games (see FanPartyCards).
    [CardName.BIONIC_AUGMENTATIONS]: {Factory: BionicAugmentations, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.SYNTHETIC_BRAIN_CELLS]: {Factory: SyntheticBrainCells, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.BUILDING_DEREGULATION]: {Factory: BuildingDeregulation, compatibility: ['turmoil', 'industries'], gigaTurmoil: true},
    [CardName.POWER_LINES_HUB]: {Factory: PowerLinesHub, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.PLEBISCITE]: {Factory: Plebiscite, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.REDISTRIBUTION_OF_WEALTH]: {Factory: RedistributionOfWealth, compatibility: ['turmoil', 'prelude'], gigaTurmoil: true},
    [CardName.CYBORGS]: {Factory: Cyborgs, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.STRONG_ARTIFICIAL_INTELLIGENCE]: {Factory: StrongArtificialIntelligence, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.COLD_FUSION_TECHNOLOGY]: {Factory: ColdFusionTechnology, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.MARTIAN_AGRICULTURE]: {Factory: MartianAgriculture, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.MANAGEMENT_CRISIS]: {Factory: ManagementCrisis, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.ENERGY_ACQUISITION]: {Factory: EnergyAcquisition, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.MARTIAN_CENSUS]: {Factory: MartianCensus, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.WANDERING_STATION_HERMES]: {Factory: WanderingStationHermes, compatibility: ['turmoil', 'pathfinders'], gigaTurmoil: true},
    [CardName.FIRST_MAN_MONUMENT]: {Factory: FirstManMonument, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.AWARD_CELEBRATION]: {Factory: AwardCelebration, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.BRIBERY]: {Factory: Bribery, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.MARS_ACADEMY_OF_POLITICAL_SCIENCES]: {Factory: MarsAcademyOfPoliticalSciences, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.IMMIGRATION_BUREAU]: {Factory: ImmigrationBureau, compatibility: 'turmoil', gigaTurmoil: true},
    [CardName.ANTI_FRAUD_INVESTIGATION]: {Factory: AntiFraudInvestigation, compatibility: 'turmoil', gigaTurmoil: true},
  },
});
