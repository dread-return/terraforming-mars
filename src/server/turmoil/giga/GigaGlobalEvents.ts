import {GlobalEventName} from '../../../common/turmoil/globalEvents/GlobalEventName';
import {GlobalEventManifest} from '../../cards/ModuleManifest';
import {InterstellarSignal} from './events/InterstellarSignal';
import {KuipersExpansion} from './events/KuipersExpansion';
import {RadicalGeoengineering} from './events/RadicalGeoengineering';
import {LifeExtension} from './events/LifeExtension';
import {LonelinessInACrowd} from './events/LonelinessInACrowd';
import {MarinersAgreements} from './events/MarinersAgreements';
import {OldEarthReserve} from './events/OldEarthReserve';
import {Overpopulation} from './events/Overpopulation';
import {PopulationCollapses} from './events/PopulationCollapses';
import {QuantumBreakthrough} from './events/QuantumBreakthrough';
import {SanctionOnTheOutskirts} from './events/SanctionOnTheOutskirts';
import {SpeciationOfHumanity} from './events/SpeciationOfHumanity';
import {UniversalUprising} from './events/UniversalUprising';
import {VenusVolcanism} from './events/VenusVolcanism';
import {AntiGovernmentSentiment} from './events/AntiGovernmentSentiment';
import {AtmosphericPorts} from './events/AtmosphericPorts';
import {BeltTighteningPolicy} from './events/BeltTighteningPolicy';
import {BlackSwanManifestation} from './events/BlackSwanManifestation';
import {BrainMachineCoupling} from './events/BrainMachineCoupling';
import {ClosedBiospheres} from './events/ClosedBiospheres';
import {Cybernetic} from './events/Cybernetic';
import {Digitalization} from './events/Digitalization';
import {ConstructionOfTheDysonSwarm} from './events/ConstructionOfTheDysonSwarm';
import {EffectsOfRadiation} from './events/EffectsOfRadiation';
import {EnergyEconomics} from './events/EnergyEconomics';
import {ExtraterrestrialPolitics} from './events/ExtraterrestrialPolitics';
import {Favoritism} from './events/Favoritism';
import {FinancialCrisis} from './events/FinancialCrisis';
import {IllegalOrbiting} from './events/IllegalOrbiting';
import {IndependentCarriers} from './events/IndependentCarriers';

/**
 * The global events of Giga Turmoil (the High Orbit: Community global events). They put neutral delegates
 * on the six Giga parties, and are added to the global events deck of every game that uses Giga Turmoil.
 * Events that need Colonies or Venus Next only join the deck when that expansion is on.
 */
export const GIGA_GLOBAL_EVENTS: GlobalEventManifest = {
  [GlobalEventName.INTERSTELLAR_SIGNAL]: {Factory: InterstellarSignal},
  [GlobalEventName.KUIPERS_EXPANSION]: {Factory: KuipersExpansion},
  [GlobalEventName.RADICAL_GEOENGINEERING]: {Factory: RadicalGeoengineering, negative: true},
  [GlobalEventName.LIFE_EXTENSION]: {Factory: LifeExtension},
  [GlobalEventName.LONELINESS_IN_A_CROWD]: {Factory: LonelinessInACrowd},
  [GlobalEventName.MARINERS_AGREEMENTS]: {Factory: MarinersAgreements},
  [GlobalEventName.OLD_EARTH_RESERVE]: {Factory: OldEarthReserve},
  [GlobalEventName.OVERPOPULATION]: {Factory: Overpopulation},
  [GlobalEventName.POPULATION_COLLAPSES]: {Factory: PopulationCollapses, compatibility: 'colonies'},
  [GlobalEventName.QUANTUM_BREAKTHROUGH]: {Factory: QuantumBreakthrough},
  [GlobalEventName.SANCTION_ON_THE_OUTSKIRTS]: {Factory: SanctionOnTheOutskirts, compatibility: 'colonies', negative: true},
  [GlobalEventName.SPECIATION_OF_HUMANITY]: {Factory: SpeciationOfHumanity, negative: true},
  [GlobalEventName.UNIVERSAL_UPRISING]: {Factory: UniversalUprising},
  [GlobalEventName.VENUS_VOLCANISM]: {Factory: VenusVolcanism, compatibility: 'venus'},
  [GlobalEventName.ANTI_GOVERNMENT_SENTIMENT]: {Factory: AntiGovernmentSentiment, negative: true},
  [GlobalEventName.ATMOSPHERIC_PORTS]: {Factory: AtmosphericPorts},
  [GlobalEventName.BELT_TIGHTENING_POLICY]: {Factory: BeltTighteningPolicy, negative: true},
  [GlobalEventName.BLACK_SWAN_MANIFESTATION]: {Factory: BlackSwanManifestation},
  [GlobalEventName.BRAIN_MACHINE_COUPLING]: {Factory: BrainMachineCoupling},
  [GlobalEventName.CLOSED_BIOSPHERES]: {Factory: ClosedBiospheres},
  [GlobalEventName.CYBERNETIC]: {Factory: Cybernetic},
  [GlobalEventName.DIGITALIZATION]: {Factory: Digitalization},
  [GlobalEventName.CONSTRUCTION_OF_THE_DYSON_SWARM]: {Factory: ConstructionOfTheDysonSwarm},
  [GlobalEventName.EFFECTS_OF_RADIATION]: {Factory: EffectsOfRadiation},
  [GlobalEventName.ENERGY_ECONOMICS]: {Factory: EnergyEconomics},
  [GlobalEventName.EXTRATERRESTRIAL_POLITICS]: {Factory: ExtraterrestrialPolitics},
  [GlobalEventName.FAVORITISM]: {Factory: Favoritism, negative: true},
  [GlobalEventName.FINANCIAL_CRISIS]: {Factory: FinancialCrisis},
  [GlobalEventName.ILLEGAL_ORBITING]: {Factory: IllegalOrbiting},
  [GlobalEventName.INDEPENDENT_CARRIERS]: {Factory: IndependentCarriers, compatibility: 'colonies'},
};
