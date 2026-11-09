import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {Suburbs} from './Suburbs';
import {HarborBorealis} from './HarborBorealis';
import {HistoricalVideographicArchive} from './HistoricalVideographicArchive';
import {IndustrialMetropolis} from './IndustrialMetropolis';
import {ORCTurbines} from './ORCTurbines';
import {ParadiseCity} from './ParadiseCity';
import {Cacti} from './Cacti';
import {AlienReactorActivation} from './AlienReactorActivation';
import {HumpbackWhales} from './HumpbackWhales';
import {UpgradedSaws} from './UpgradedSaws';
import {LaunchOfThePhoenix} from './LaunchOfThePhoenix';
import {UtopiaPlanitiaSpaceport} from './UtopiaPlanitiaSpaceport';
import {MartianArmedForces} from './MartianArmedForces';
import {ExcavationSyriaPlanum} from './ExcavationSyriaPlanum';
import {WeatherControlTower} from './WeatherControlTower';
import {BattleOfZadonga} from './BattleOfZadonga';
import {DogsInSpace} from './DogsInSpace';
import {StemCellResearchCenter} from './StemCellResearchCenter';
import {RooftopGardensOfNoctis} from './RooftopGardensOfNoctis';
import {GreatLighthouseOfAlbaPatera} from './GreatLighthouseOfAlbaPatera';
import {GreatFaceOfCydonia} from './GreatFaceOfCydonia';
import {MausoleumAtHellas} from './MausoleumAtHellas';
import {StatueOfVonBraun} from './StatueOfVonBraun';
import {TharsisColossus} from './TharsisColossus';
import {TempleOfGaiaAtElysium} from './TempleOfGaiaAtElysium';
import {BattleOverMars} from './BattleOverMars';
import {LivestockGiantDome} from './LivestockGiantDome';
import {LightningAccumulators} from './LightningAccumulators';
import {MartianRangers} from './MartianRangers';
import {Bioreactors} from './Bioreactors';
import {NeptuneExpedition} from './NeptuneExpedition';
import {BiomassConversionPlant} from './BiomassConversionPlant';
import {OpeningOfNaturalReserves} from './OpeningOfNaturalReserves';
import {Clonation} from './Clonation';
import {MuskAwards} from './MuskAwards';
import {MonumentToMars} from './MonumentToMars';
import {SupernovaExplosion} from './SupernovaExplosion';
import {OrganicWasteRecycling} from './OrganicWasteRecycling';
import {SMESTechnology} from './SMESTechnology';
import {TharsisPumpingHub} from './TharsisPumpingHub';
import {PlanetaryMuseum} from './PlanetaryMuseum';
import {MicrobioticOceanicFauna} from './MicrobioticOceanicFauna';
import {ObservatoryOnOlympusMons} from './ObservatoryOnOlympusMons';
import {PrehistoricBeasts} from './PrehistoricBeasts';
import {GIGAInterferometer} from './GIGAInterferometer';
import {MartianCommercialSeafleet} from './MartianCommercialSeafleet';
import {DataLibrary} from './DataLibrary';
import {MineralDepot} from './MineralDepot';
import {HeavyMachinery} from './HeavyMachinery';
import {SedimentaryRocks} from './SedimentaryRocks';
import {ExtraVehicularActivities} from './ExtraVehicularActivities';
import {OrbitalBiologicalLaboratory} from './OrbitalBiologicalLaboratory';
import {SpaceRobots} from './SpaceRobots';
import {AlgorithmicTrading} from './AlgorithmicTrading';
import {Ecoplants} from './Ecoplants';
import {MiningOutpost} from './MiningOutpost';
import {ExportsFromAmalthea} from './ExportsFromAmalthea';
import {InterplanetaryCruise} from './InterplanetaryCruise';
import {MoonMineralMetropolis} from './MoonMineralMetropolis';
import {CloudCity} from './CloudCity';
import {TroposphericCity} from './TroposphericCity';
import {MeteorShower} from './MeteorShower';

/**
 * Rob Antilles' fan cards, as reworked for the Terraforming Mars GIGA Expansion.
 * https://boardgamegeek.com/thread/2293920/terraforming-mars-giga-expansion-ares-pathfinder-b
 *
 * Not included yet: the 7 cards that need the GIGA Turmoil parties (H06, H08, H10, H21, H47, H67, H69)
 * and the 2 cities placed on Venus (H19, H24), which wait for the GIGA board.
 */
export const ROB_ANTILLES_CARD_MANIFEST = new ModuleManifest({
  module: 'robantilles',
  projectCards: {
    [CardName.SUBURBS]: {Factory: Suburbs},
    [CardName.HARBOR_BOREALIS]: {Factory: HarborBorealis},
    [CardName.HISTORICAL_VIDEOGRAPHIC_ARCHIVE]: {Factory: HistoricalVideographicArchive},
    [CardName.INDUSTRIAL_METROPOLIS]: {Factory: IndustrialMetropolis},
    [CardName.ORC_TURBINES]: {Factory: ORCTurbines},
    [CardName.PARADISE_CITY]: {Factory: ParadiseCity},
    [CardName.CACTI]: {Factory: Cacti},
    [CardName.ALIEN_REACTOR_ACTIVATION]: {Factory: AlienReactorActivation},
    [CardName.HUMPBACK_WHALES]: {Factory: HumpbackWhales},
    [CardName.UPGRADED_SAWS]: {Factory: UpgradedSaws},
    [CardName.LAUNCH_OF_THE_PHOENIX]: {Factory: LaunchOfThePhoenix},
    [CardName.UTOPIA_PLANITIA_SPACEPORT]: {Factory: UtopiaPlanitiaSpaceport, compatibility: 'turmoil'},
    [CardName.MARTIAN_ARMED_FORCES]: {Factory: MartianArmedForces},
    [CardName.EXCAVATION_SYRIA_PLANUM]: {Factory: ExcavationSyriaPlanum},
    [CardName.WEATHER_CONTROL_TOWER]: {Factory: WeatherControlTower},
    [CardName.BATTLE_OF_ZADONGA]: {Factory: BattleOfZadonga},
    [CardName.DOGS_IN_SPACE]: {Factory: DogsInSpace},
    [CardName.STEM_CELL_RESEARCH_CENTER]: {Factory: StemCellResearchCenter},
    [CardName.ROOFTOP_GARDENS_OF_NOCTIS]: {Factory: RooftopGardensOfNoctis},
    [CardName.GREAT_LIGHTHOUSE_OF_ALBA_PATERA]: {Factory: GreatLighthouseOfAlbaPatera},
    [CardName.GREAT_FACE_OF_CYDONIA]: {Factory: GreatFaceOfCydonia},
    [CardName.MAUSOLEUM_AT_HELLAS]: {Factory: MausoleumAtHellas},
    [CardName.STATUE_OF_VON_BRAUN]: {Factory: StatueOfVonBraun},
    [CardName.THARSIS_COLOSSUS]: {Factory: TharsisColossus, compatibility: 'turmoil'},
    [CardName.TEMPLE_OF_GAIA_AT_ELYSIUM]: {Factory: TempleOfGaiaAtElysium, compatibility: 'turmoil'},
    [CardName.BATTLE_OVER_MARS]: {Factory: BattleOverMars},
    [CardName.LIVESTOCK_GIANT_DOME]: {Factory: LivestockGiantDome},
    [CardName.LIGHTNING_ACCUMULATORS]: {Factory: LightningAccumulators},
    [CardName.MARTIAN_RANGERS]: {Factory: MartianRangers},
    [CardName.BIOREACTORS]: {Factory: Bioreactors},
    [CardName.NEPTUNE_EXPEDITION]: {Factory: NeptuneExpedition},
    [CardName.BIOMASS_CONVERSION_PLANT]: {Factory: BiomassConversionPlant},
    [CardName.OPENING_OF_NATURAL_RESERVES]: {Factory: OpeningOfNaturalReserves},
    [CardName.CLONATION]: {Factory: Clonation, compatibility: 'turmoil'},
    [CardName.MUSK_AWARDS]: {Factory: MuskAwards},
    [CardName.MONUMENT_TO_MARS]: {Factory: MonumentToMars},
    [CardName.SUPERNOVA_EXPLOSION]: {Factory: SupernovaExplosion},
    [CardName.ORGANIC_WASTE_RECYCLING]: {Factory: OrganicWasteRecycling},
    [CardName.SMES_TECHNOLOGY]: {Factory: SMESTechnology},
    [CardName.THARSIS_PUMPING_HUB]: {Factory: TharsisPumpingHub},
    [CardName.PLANETARY_MUSEUM]: {Factory: PlanetaryMuseum},
    [CardName.MICROBIOTIC_OCEANIC_FAUNA]: {Factory: MicrobioticOceanicFauna},
    [CardName.OBSERVATORY_ON_OLYMPUS_MONS]: {Factory: ObservatoryOnOlympusMons},
    [CardName.PREHISTORIC_BEASTS]: {Factory: PrehistoricBeasts},
    [CardName.GIGA_INTERFEROMETER]: {Factory: GIGAInterferometer},
    [CardName.MARTIAN_COMMERCIAL_SEAFLEET]: {Factory: MartianCommercialSeafleet},
    [CardName.DATA_LIBRARY]: {Factory: DataLibrary},
    [CardName.MINERAL_DEPOT]: {Factory: MineralDepot},
    [CardName.HEAVY_MACHINERY]: {Factory: HeavyMachinery},
    [CardName.SEDIMENTARY_ROCKS]: {Factory: SedimentaryRocks},
    [CardName.EXTRA_VEHICULAR_ACTIVITIES]: {Factory: ExtraVehicularActivities},
    [CardName.ORBITAL_BIOLOGICAL_LABORATORY]: {Factory: OrbitalBiologicalLaboratory},
    [CardName.SPACE_ROBOTS]: {Factory: SpaceRobots},
    [CardName.ALGORITHMIC_TRADING]: {Factory: AlgorithmicTrading},
    [CardName.ECOPLANTS]: {Factory: Ecoplants},
    [CardName.MINING_OUTPOST]: {Factory: MiningOutpost},
    [CardName.EXPORTS_FROM_AMALTHEA]: {Factory: ExportsFromAmalthea},
    [CardName.INTERPLANETARY_CRUISE]: {Factory: InterplanetaryCruise},
    [CardName.MOON_MINERAL_METROPOLIS]: {Factory: MoonMineralMetropolis, compatibility: 'moon'},
    // Need the Venus map from Venus Phase 2.
    [CardName.CLOUD_CITY_RA]: {Factory: CloudCity, compatibility: 'venusphase2'},
    [CardName.TROPOSPHERIC_CITY]: {Factory: TroposphericCity, compatibility: 'venusphase2'},
    [CardName.METEOR_SHOWER]: {Factory: MeteorShower},
  },
});
