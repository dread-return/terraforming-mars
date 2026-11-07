import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {AerosolIsotopes} from './AerosolIsotopes';
import {AtomicTest} from './AtomicTest';
import {BecquerelFluctuations} from './BecquerelFluctuations';
import {CEOHeartAttack} from './CEOHeartAttack';
import {Caracals} from './Caracals';
import {Centrifuge} from './Centrifuge';
import {Chemtrails} from './Chemtrails';
import {Cockroaches} from './Cockroaches';
import {ColdFusionReactor} from './ColdFusionReactor';
import {CoolingLiquidEmergency} from './CoolingLiquidEmergency';
import {CosmicRayAnalysis} from './CosmicRayAnalysis';
import {EnergizingLava} from './EnergizingLava';
import {EnergyBudgetCutoffs} from './EnergyBudgetCutoffs';
import {EnvironmentContamination} from './EnvironmentContamination';
import {EnvironmentalDisaster} from './EnvironmentalDisaster';
import {EsotericCommunity} from './EsotericCommunity';
import {EvacuationZone} from './EvacuationZone';
import {ExhaustedBars} from './ExhaustedBars';
import {ExplorationMiningSite} from './ExplorationMiningSite';
import {ExtinctionLevelEvent} from './ExtinctionLevelEvent';
import {FalseFlagOperations} from './FalseFlagOperations';
import {ForestFires} from './ForestFires';
import {FreeRadicals} from './FreeRadicals';
import {FuelRods} from './FuelRods';
import {FukushimaFarming} from './FukushimaFarming';
import {GeneticMutations} from './GeneticMutations';
import {GenomicNucleationCentre} from './GenomicNucleationCentre';
import {H2OMoleculesResearch} from './H2OMoleculesResearch';
import {ITERFunding} from './ITERFunding';
import {InfraredTherapy} from './InfraredTherapy';
import {IntuitiveProbe} from './IntuitiveProbe';
import {IodineIntoxication} from './IodineIntoxication';
import {IonBeamMedicalFacility} from './IonBeamMedicalFacility';
import {IonizedGasHarvest} from './IonizedGasHarvest';
import {Jellyfish} from './Jellyfish';
import {JovianMegaResearchBay} from './JovianMegaResearchBay';
import {MainDockingStation} from './MainDockingStation';
import {MartianAtomicCommittee} from './MartianAtomicCommittee';
import {MirrorHeatExchangers} from './MirrorHeatExchangers';
import {MissileDefenseMatrix} from './MissileDefenseMatrix';
import {MutatedTrees} from './MutatedTrees';
import {NeutrinoDetector} from './NeutrinoDetector';
import {Neutronia} from './Neutronia';
import {NitrateCombustion} from './NitrateCombustion';
import {NuclearClassifiedLaboratory} from './NuclearClassifiedLaboratory';
import {NuclearMartianSummit} from './NuclearMartianSummit';
import {NuclearWasteLogistics} from './NuclearWasteLogistics';
import {NuclearWinter} from './NuclearWinter';
import {OberonTradingStation} from './OberonTradingStation';
import {OceanicAtomicTests} from './OceanicAtomicTests';
import {OxygenGardens} from './OxygenGardens';
import {ParticleAccelerator} from './ParticleAccelerator';
import {PlanetX} from './PlanetX';
import {ProcessedTitanium} from './ProcessedTitanium';
import {ProforestationFunding} from './ProforestationFunding';
import {PropagandaConference} from './PropagandaConference';
import {RadiationShielding} from './RadiationShielding';
import {RadioactiveDecay} from './RadioactiveDecay';
import {RadioactiveDeflux} from './RadioactiveDeflux';
import {RadioactiveEnhancement} from './RadioactiveEnhancement';
import {RefugeesRoundup} from './RefugeesRoundup';
import {RelativisticHalfLife} from './RelativisticHalfLife';
import {Retrovirus} from './Retrovirus';
import {SoilDecontamination} from './SoilDecontamination';
import {SolarFlare} from './SolarFlare';
import {SolarIrradiance} from './SolarIrradiance';
import {SpecializedIndustrialComplex} from './SpecializedIndustrialComplex';
import {StellarNova} from './StellarNova';
import {StorageSite} from './StorageSite';
import {Stormfarm} from './Stormfarm';
import {ThoriumReactor} from './ThoriumReactor';
import {TokamakFunding} from './TokamakFunding';
import {TritiumStation} from './TritiumStation';
import {TritonCampaign} from './TritonCampaign';
import {UraniumEnrichmentFacility} from './UraniumEnrichmentFacility';
import {UraniumMine} from './UraniumMine';
import {WasteDisposalTax} from './WasteDisposalTax';
import {WaterReservoirAnalysis} from './WaterReservoirAnalysis';
import {ArtificialSun} from './ArtificialSun';
import {CallistoFieldArrays} from './CallistoFieldArrays';
import {EMFConnection} from './EMFConnection';
import {EliteCommandBase} from './EliteCommandBase';
import {WasteBurial} from './WasteBurial';

export const NUCLEAR_CARD_MANIFEST = new ModuleManifest({
  module: 'nuclear',
  projectCards: {
    [CardName.AEROSOL_ISOTOPES]: {Factory: AerosolIsotopes},
    [CardName.ATOMIC_TEST]: {Factory: AtomicTest},
    [CardName.BECQUEREL_FLUCTUATIONS]: {Factory: BecquerelFluctuations},
    [CardName.CEO_HEART_ATTACK]: {Factory: CEOHeartAttack},
    [CardName.CARACALS]: {Factory: Caracals},
    [CardName.CENTRIFUGE]: {Factory: Centrifuge},
    [CardName.CHEMTRAILS]: {Factory: Chemtrails},
    [CardName.COCKROACHES]: {Factory: Cockroaches},
    [CardName.COLD_FUSION_REACTOR]: {Factory: ColdFusionReactor},
    [CardName.COOLING_LIQUID_EMERGENCY]: {Factory: CoolingLiquidEmergency},
    [CardName.COSMIC_RAY_ANALYSIS]: {Factory: CosmicRayAnalysis},
    [CardName.ENERGIZING_LAVA]: {Factory: EnergizingLava},
    [CardName.ENERGY_BUDGET_CUTOFFS]: {Factory: EnergyBudgetCutoffs},
    [CardName.ENVIRONMENT_CONTAMINATION]: {Factory: EnvironmentContamination},
    [CardName.ENVIRONMENTAL_DISASTER]: {Factory: EnvironmentalDisaster},
    [CardName.ESOTERIC_COMMUNITY]: {Factory: EsotericCommunity},
    [CardName.EVACUATION_ZONE]: {Factory: EvacuationZone},
    [CardName.EXHAUSTED_BARS]: {Factory: ExhaustedBars},
    [CardName.EXPLORATION_MINING_SITE]: {Factory: ExplorationMiningSite},
    [CardName.EXTINCTION_LEVEL_EVENT]: {Factory: ExtinctionLevelEvent},
    [CardName.FALSE_FLAG_OPERATIONS]: {Factory: FalseFlagOperations},
    [CardName.FOREST_FIRES]: {Factory: ForestFires},
    [CardName.FREE_RADICALS]: {Factory: FreeRadicals},
    [CardName.FUEL_RODS]: {Factory: FuelRods},
    [CardName.FUKUSHIMA_FARMING]: {Factory: FukushimaFarming},
    [CardName.GENETIC_MUTATIONS]: {Factory: GeneticMutations},
    [CardName.GENOMIC_NUCLEATION_CENTRE]: {Factory: GenomicNucleationCentre},
    [CardName.H2O_MOLECULES_RESEARCH]: {Factory: H2OMoleculesResearch},
    [CardName.ITER_FUNDING]: {Factory: ITERFunding},
    [CardName.INFRARED_THERAPY]: {Factory: InfraredTherapy},
    [CardName.INTUITIVE_PROBE]: {Factory: IntuitiveProbe},
    [CardName.IODINE_INTOXICATION]: {Factory: IodineIntoxication},
    [CardName.ION_BEAM_MEDICAL_FACILITY]: {Factory: IonBeamMedicalFacility},
    [CardName.IONIZED_GAS_HARVEST]: {Factory: IonizedGasHarvest},
    [CardName.JELLYFISH]: {Factory: Jellyfish},
    [CardName.JOVIAN_MEGA_RESEARCH_BAY]: {Factory: JovianMegaResearchBay},
    [CardName.MAIN_DOCKING_STATION]: {Factory: MainDockingStation},
    [CardName.MARTIAN_ATOMIC_COMMITTEE]: {Factory: MartianAtomicCommittee},
    [CardName.MIRROR_HEAT_EXCHANGERS]: {Factory: MirrorHeatExchangers},
    [CardName.MISSILE_DEFENSE_MATRIX]: {Factory: MissileDefenseMatrix},
    [CardName.MUTATED_TREES]: {Factory: MutatedTrees},
    [CardName.NEUTRINO_DETECTOR]: {Factory: NeutrinoDetector},
    [CardName.NEUTRONIA]: {Factory: Neutronia},
    [CardName.NITRATE_COMBUSTION]: {Factory: NitrateCombustion},
    [CardName.NUCLEAR_CLASSIFIED_LABORATORY]: {Factory: NuclearClassifiedLaboratory},
    [CardName.NUCLEAR_MARTIAN_SUMMIT]: {Factory: NuclearMartianSummit},
    [CardName.NUCLEAR_WASTE_LOGISTICS]: {Factory: NuclearWasteLogistics},
    [CardName.NUCLEAR_WINTER]: {Factory: NuclearWinter},
    [CardName.OBERON_TRADING_STATION]: {Factory: OberonTradingStation, compatibility: 'colonies'},
    [CardName.OCEANIC_ATOMIC_TESTS]: {Factory: OceanicAtomicTests},
    [CardName.OXYGEN_GARDENS]: {Factory: OxygenGardens},
    [CardName.PARTICLE_ACCELERATOR]: {Factory: ParticleAccelerator},
    [CardName.PLANET_X]: {Factory: PlanetX},
    [CardName.PROCESSED_TITANIUM]: {Factory: ProcessedTitanium},
    [CardName.PROFORESTATION_FUNDING]: {Factory: ProforestationFunding},
    [CardName.PROPAGANDA_CONFERENCE]: {Factory: PropagandaConference},
    [CardName.RADIATION_SHIELDING]: {Factory: RadiationShielding},
    [CardName.RADIOACTIVE_DECAY]: {Factory: RadioactiveDecay},
    [CardName.RADIOACTIVE_DEFLUX]: {Factory: RadioactiveDeflux},
    [CardName.RADIOACTIVE_ENHANCEMENT]: {Factory: RadioactiveEnhancement},
    [CardName.REFUGEES_ROUNDUP]: {Factory: RefugeesRoundup},
    [CardName.RELATIVISTIC_HALF_LIFE]: {Factory: RelativisticHalfLife},
    [CardName.RETROVIRUS]: {Factory: Retrovirus},
    [CardName.SOIL_DECONTAMINATION]: {Factory: SoilDecontamination},
    [CardName.SOLAR_FLARE]: {Factory: SolarFlare},
    [CardName.SOLAR_IRRADIANCE]: {Factory: SolarIrradiance},
    [CardName.SPECIALIZED_INDUSTRIAL_COMPLEX]: {Factory: SpecializedIndustrialComplex},
    [CardName.STELLAR_NOVA]: {Factory: StellarNova},
    [CardName.STORAGE_SITE]: {Factory: StorageSite},
    [CardName.STORMFARM]: {Factory: Stormfarm},
    [CardName.THORIUM_REACTOR]: {Factory: ThoriumReactor},
    [CardName.TOKAMAK_FUNDING]: {Factory: TokamakFunding},
    [CardName.TRITIUM_STATION]: {Factory: TritiumStation},
    [CardName.TRITON_CAMPAIGN]: {Factory: TritonCampaign},
    [CardName.URANIUM_ENRICHMENT_FACILITY]: {Factory: UraniumEnrichmentFacility},
    [CardName.URANIUM_MINE]: {Factory: UraniumMine},
    [CardName.WASTE_DISPOSAL_TAX]: {Factory: WasteDisposalTax},
    [CardName.WATER_RESERVOIR_ANALYSIS]: {Factory: WaterReservoirAnalysis},
  },
  preludeCards: {
    [CardName.ARTIFICIAL_SUN]: {Factory: ArtificialSun},
    [CardName.CALLISTO_FIELD_ARRAYS]: {Factory: CallistoFieldArrays},
    [CardName.EMF_CONNECTION]: {Factory: EMFConnection},
    [CardName.ELITE_COMMAND_BASE]: {Factory: EliteCommandBase},
    [CardName.WASTE_BURIAL]: {Factory: WasteBurial},
  },
});
