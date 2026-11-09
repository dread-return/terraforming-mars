import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {AlphaRegioIncubators} from './AlphaRegioIncubators';
import {AphroditeShuttleBase} from './AphroditeShuttleBase';
import {ArgonMine} from './ArgonMine';
import {AtmoSequester} from './AtmoSequester';
import {BioWasteReactor} from './BioWasteReactor';
import {CallistoDockingStation} from './CallistoDockingStation';
import {CloudCityStandardProject} from './CloudCityStandardProject';
import {ComputationalBiology} from './ComputationalBiology';
import {CoolingPillars} from './CoolingPillars';
import {DysonHarropSatellite} from './DysonHarropSatellite';
import {FloaterFactory} from './FloaterFactory';
import {FloatingArrayStandardProject} from './FloatingArrayStandardProject';
import {GasMineStandardProject} from './GasMineStandardProject';
import {GasTurbines} from './GasTurbines';
import {HeatTrappersNetwork} from './HeatTrappersNetwork';
import {HighPressureSuits} from './HighPressureSuits';
import {ImprovedFloatingSystems} from './ImprovedFloatingSystems';
import {InSituResourceUtilization} from './InSituResourceUtilization';
import {InterplanetaryRoutes} from './InterplanetaryRoutes';
import {IonicThrustersSupport} from './IonicThrustersSupport';
import {IshtarEnergyNetwork} from './IshtarEnergyNetwork';
import {IshtarOrbitingAcademy} from './IshtarOrbitingAcademy';
import {KryptonMine} from './KryptonMine';
import {Menagerie} from './Menagerie';
import {ModularQuarters} from './ModularQuarters';
import {NativeMicrofauna} from './NativeMicrofauna';
import {NegativeMassFluids} from './NegativeMassFluids';
import {NewAlexandria} from './NewAlexandria';
import {NewAthens} from './NewAthens';
import {NewBabylon} from './NewBabylon';
import {NewRome} from './NewRome';
import {Outskirts} from './Outskirts';
import {OvdaRegioMassDriver} from './OvdaRegioMassDriver';
import {PollutionControl} from './PollutionControl';
import {RadonMine} from './RadonMine';
import {SisterColonies} from './SisterColonies';
import {SolarWindTrap} from './SolarWindTrap';
import {StarwindIITradeship} from './StarwindIITradeship';
import {SurveyorsTeam} from './SurveyorsTeam';
import {SyntheticBiology} from './SyntheticBiology';
import {TransmissionTowers} from './TransmissionTowers';
import {VenusAircraftHaven} from './VenusAircraftHaven';
import {VenusKickstarting} from './VenusKickstarting';
import {VenusTradeship} from './VenusTradeship';
import {VenusianInfrastructures} from './VenusianInfrastructures';
import {VenusianResearchCommittee} from './VenusianResearchCommittee';
import {VenusianWanderer} from './VenusianWanderer';
import {XenonMine} from './XenonMine';

export const VENUS_PHASE_2_CARD_MANIFEST = new ModuleManifest({
  module: 'venusphase2',
  projectCards: {
    [CardName.ALPHA_REGIO_INCUBATORS]: {Factory: AlphaRegioIncubators},
    [CardName.APHRODITE_SHUTTLE_BASE]: {Factory: AphroditeShuttleBase},
    [CardName.ARGON_MINE]: {Factory: ArgonMine},
    [CardName.ATMO_SEQUESTER]: {Factory: AtmoSequester},
    [CardName.BIO_WASTE_REACTOR]: {Factory: BioWasteReactor},
    [CardName.CALLISTO_DOCKING_STATION]: {Factory: CallistoDockingStation},
    [CardName.COMPUTATIONAL_BIOLOGY]: {Factory: ComputationalBiology},
    [CardName.COOLING_PILLARS]: {Factory: CoolingPillars},
    [CardName.DYSON_HARROP_SATELLITE]: {Factory: DysonHarropSatellite},
    [CardName.FLOATER_FACTORY]: {Factory: FloaterFactory},
    [CardName.GAS_TURBINES]: {Factory: GasTurbines},
    [CardName.HEAT_TRAPPERS_NETWORK]: {Factory: HeatTrappersNetwork},
    [CardName.HIGH_PRESSURE_SUITS]: {Factory: HighPressureSuits},
    [CardName.IMPROVED_FLOATING_SYSTEMS]: {Factory: ImprovedFloatingSystems},
    [CardName.IN_SITU_RESOURCE_UTILIZATION]: {Factory: InSituResourceUtilization, compatibility: 'colonies'},
    [CardName.INTERPLANETARY_ROUTES]: {Factory: InterplanetaryRoutes, compatibility: 'colonies'},
    [CardName.IONIC_THRUSTERS_SUPPORT]: {Factory: IonicThrustersSupport},
    [CardName.ISHTAR_ENERGY_NETWORK]: {Factory: IshtarEnergyNetwork},
    [CardName.ISHTAR_ORBITING_ACADEMY]: {Factory: IshtarOrbitingAcademy},
    [CardName.KRYPTON_MINE]: {Factory: KryptonMine},
    [CardName.MENAGERIE]: {Factory: Menagerie},
    [CardName.MODULAR_QUARTERS]: {Factory: ModularQuarters},
    [CardName.NATIVE_MICROFAUNA]: {Factory: NativeMicrofauna},
    [CardName.NEGATIVE_MASS_FLUIDS]: {Factory: NegativeMassFluids},
    [CardName.NEW_ALEXANDRIA]: {Factory: NewAlexandria},
    [CardName.NEW_ATHENS]: {Factory: NewAthens},
    [CardName.NEW_BABYLON]: {Factory: NewBabylon},
    [CardName.NEW_ROME]: {Factory: NewRome, compatibility: 'turmoil'},
    [CardName.OUTSKIRTS]: {Factory: Outskirts},
    [CardName.OVDA_REGIO_MASS_DRIVER]: {Factory: OvdaRegioMassDriver},
    [CardName.POLLUTION_CONTROL]: {Factory: PollutionControl},
    [CardName.RADON_MINE]: {Factory: RadonMine},
    [CardName.SISTER_COLONIES]: {Factory: SisterColonies, compatibility: 'colonies'},
    [CardName.SOLAR_WIND_TRAP]: {Factory: SolarWindTrap},
    [CardName.STARWIND_II_TRADESHIP]: {Factory: StarwindIITradeship, compatibility: 'colonies'},
    [CardName.SURVEYORS_TEAM]: {Factory: SurveyorsTeam},
    [CardName.SYNTHETIC_BIOLOGY]: {Factory: SyntheticBiology},
    [CardName.TRANSMISSION_TOWERS]: {Factory: TransmissionTowers},
    [CardName.VENUS_AIRCRAFT_HAVEN]: {Factory: VenusAircraftHaven},
    [CardName.VENUS_KICKSTARTING]: {Factory: VenusKickstarting},
    [CardName.VENUS_TRADESHIP]: {Factory: VenusTradeship},
    [CardName.VENUSIAN_INFRASTRUCTURES]: {Factory: VenusianInfrastructures},
    [CardName.VENUSIAN_RESEARCH_COMMITTEE]: {Factory: VenusianResearchCommittee},
    [CardName.VENUSIAN_WANDERER]: {Factory: VenusianWanderer},
    [CardName.XENON_MINE]: {Factory: XenonMine},
  },
  standardProjects: {
    [CardName.CLOUD_CITY_STANDARD_PROJECT]: {Factory: CloudCityStandardProject},
    [CardName.FLOATING_ARRAY_STANDARD_PROJECT]: {Factory: FloatingArrayStandardProject},
    [CardName.GAS_MINE_STANDARD_PROJECT]: {Factory: GasMineStandardProject},
  },
});
