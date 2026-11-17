import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {AquarinEnt} from './AquarinEnt';
import {Aquatix} from './Aquatix';
import {ArtemisClub} from './ArtemisClub';
import {ArtographersCollective} from './ArtographersCollective';
import {AstroBiotics} from './AstroBiotics';
import {Barsoom} from './Barsoom';
import {BarsoomianAtmospherics} from './BarsoomianAtmospherics';
import {Biome} from './Biome';
import {BradburyBradburyAndAnderson} from './BradburyBradburyAndAnderson';
import {BuyNLarge} from './BuyNLarge';
import {CapitalFundingInitiative} from './CapitalFundingInitiative';
import {Catnip} from './Catnip';
import {CollinsRubinAndHaytham} from './CollinsRubinAndHaytham';
import {CoreConductionSystems} from './CoreConductionSystems';
import {CriticalHitEnterprises} from './CriticalHitEnterprises';
import {Cultured} from './Cultured';
import {ExternalRevenueService} from './ExternalRevenueService';
import {ExtrasolarColonizationAdministration} from './ExtrasolarColonizationAdministration';
import {EyeInTheSky} from './EyeInTheSky';
import {Feastfair} from './Feastfair';
import {Forj} from './Forj';
import {Fractal} from './Fractal';
import {FreeDome} from './FreeDome';
import {GalacticPark} from './GalacticPark';
import {Galacticer} from './Galacticer';
import {Genecraft} from './Genecraft';
import {GrowBit} from './GrowBit';
import {Harbinger} from './Harbinger';
import {Hera} from './Hera';
import {HeyerEducation} from './HeyerEducation';
import {HydroSol} from './HydroSol';
import {Hydrodynamics} from './Hydrodynamics';
import {Leviathan} from './Leviathan';
import {LiandriMiningCorporation} from './LiandriMiningCorporation';
import {LobosDelCielo} from './LobosDelCielo';
import {MMBio} from './MMBio';
import {Marin} from './Marin';
import {MarsActiveResources} from './MarsActiveResources';
import {MarsIncorporated} from './MarsIncorporated';
import {MicroMassSystems} from './MicroMassSystems';
import {O2} from './O2';
import {OlympicGalacticCorporation} from './OlympicGalacticCorporation';
import {OmniConsumerProducts} from './OmniConsumerProducts';
import {OphirPlanumNurseryGardens} from './OphirPlanumNurseryGardens';
import {PRG} from './PRG';
import {Pallas} from './Pallas';
import {Petriolium} from './Petriolium';
import {PhotoSynthesists} from './PhotoSynthesists';
import {PlanetaryHomeostasisBureau} from './PlanetaryHomeostasisBureau';
import {Protogen} from './Protogen';
import {PsiCorps} from './PsiCorps';
import {PurNKleen} from './PurNKleen';
import {RedLifeProject} from './RedLifeProject';
import {RedShip} from './RedShip';
import {ScolexIndustries} from './ScolexIndustries';
import {ShinraTechnologies} from './ShinraTechnologies';
import {Sirenia} from './Sirenia';
import {SolarVoyager} from './SolarVoyager';
import {SoukaiSyndicate} from './SoukaiSyndicate';
import {SymbioticHealthSystems} from './SymbioticHealthSystems';
import {SymbioticSystems} from './SymbioticSystems';
import {TEPCO} from './TEPCO';
import {ThePigfartsInitiative} from './ThePigfartsInitiative';
import {Troidco} from './Troidco';
import {UnderSec} from './UnderSec';
import {UnionAerospace} from './UnionAerospace';
import {VulcanFoundries} from './VulcanFoundries';
import {WeylandYutaniCorp} from './WeylandYutaniCorp';
import {AcquireUnlimited} from './AcquireUnlimited';
import {AdvancedMiningAssociation} from './AdvancedMiningAssociation';
import {AquatechCorp} from './AquatechCorp';
import {AresSecurity} from './AresSecurity';
import {AresTechnology} from './AresTechnology';
import {AresUnion} from './AresUnion';
import {Aria} from './Aria';
import {AstraMechanika} from './AstraMechanika';
import {Blizzcorp} from './Blizzcorp';
import {ChaangFuelsInc} from './ChaangFuelsInc';
import {CheapChispa} from './CheapChispa';
import {Cloudmind} from './Cloudmind';
import {CoeurlIndustries} from './CoeurlIndustries';
import {ColonialOne} from './ColonialOne';
import {DevWright} from './DevWright';
import {DubaiColonyInitiative} from './DubaiColonyInitiative';
import {EarthFirst} from './EarthFirst';
import {EtherEnterprise} from './EtherEnterprise';
import {HermeticOrderOfMarsEpic} from './HermeticOrderOfMarsEpic';
import {ImperioSolarMarciano} from './ImperioSolarMarciano';
import {LazarusLaboratories} from './LazarusLaboratories';
import {LogosResearchAndDevelopment} from './LogosResearchAndDevelopment';
import {MaraboutShiritori} from './MaraboutShiritori';
import {NOJO} from './NOJO';
import {Neptune} from './Neptune';
import {NewTech} from './NewTech';
import {Oasis} from './Oasis';
import {OpportunisticConsortium} from './OpportunisticConsortium';
import {OrbitalEye} from './OrbitalEye';
import {Ouroboros} from './Ouroboros';
import {Pathfinder} from './Pathfinder';
import {PolitiCorp} from './PolitiCorp';
import {PrincessLtd} from './PrincessLtd';
import {SolarEnterprises} from './SolarEnterprises';
import {SpartansSecurity} from './SpartansSecurity';
import {TEO} from './TEO';
import {Thermex} from './Thermex';
import {Toyitsu} from './Toyitsu';
import {TrueMarsFoundation} from './TrueMarsFoundation';
import {TwinCitiesOfHelium} from './TwinCitiesOfHelium';

/**
 * Epic Corporations. They belong to Corporate Era: the manifest uses the corpera module,
 * so they join the corporation deck whenever Corporate Era is on and are listed under it.
 *
 * `compatibility` keeps a corp out unless the expansions it needs are on. That includes
 * corps whose tags belong to an expansion (Mars tag: Pathfinders, Venus tag: Venus Next, ...),
 * so those tags don't appear in games without that expansion.
 */
export const EPIC_CARD_MANIFEST = new ModuleManifest({
  module: 'corpera',
  corporationCards: {
    [CardName.AQUARIN_ENT]: {Factory: AquarinEnt},
    [CardName.AQUATIX]: {Factory: Aquatix},
    [CardName.ARTEMIS_CLUB]: {Factory: ArtemisClub},
    [CardName.ARTOGRAPHERS_COLLECTIVE]: {Factory: ArtographersCollective},
    [CardName.ASTRO_BIOTICS]: {Factory: AstroBiotics},
    [CardName.BARSOOM]: {Factory: Barsoom},
    [CardName.BARSOOMIAN_ATMOSPHERICS]: {Factory: BarsoomianAtmospherics},
    [CardName.BIOME]: {Factory: Biome},
    [CardName.BRADBURY_BRADBURY_AND_ANDERSON]: {Factory: BradburyBradburyAndAnderson, compatibility: 'pathfinders'},
    [CardName.BUY_N_LARGE]: {Factory: BuyNLarge},
    [CardName.CAPITAL_FUNDING_INITIATIVE]: {Factory: CapitalFundingInitiative},
    [CardName.CATNIP]: {Factory: Catnip},
    [CardName.COLLINS_RUBIN_AND_HAYTHAM]: {Factory: CollinsRubinAndHaytham},
    [CardName.CORE_CONDUCTION_SYSTEMS]: {Factory: CoreConductionSystems},
    [CardName.CRITICAL_HIT_ENTERPRISES]: {Factory: CriticalHitEnterprises},
    [CardName.CULTURED]: {Factory: Cultured},
    [CardName.EXTERNAL_REVENUE_SERVICE]: {Factory: ExternalRevenueService},
    [CardName.EXTRASOLAR_COLONIZATION_ADMINISTRATION]: {Factory: ExtrasolarColonizationAdministration},
    [CardName.EYE_IN_THE_SKY]: {Factory: EyeInTheSky},
    [CardName.FEASTFAIR]: {Factory: Feastfair},
    [CardName.FORJ]: {Factory: Forj},
    [CardName.FRACTAL]: {Factory: Fractal},
    [CardName.FREEDOME]: {Factory: FreeDome},
    [CardName.GALACTICER]: {Factory: Galacticer, compatibility: 'solaris'},
    [CardName.GALACTIC_PARK]: {Factory: GalacticPark},
    [CardName.GENECRAFT]: {Factory: Genecraft},
    [CardName.GROWBIT]: {Factory: GrowBit, compatibility: 'pathfinders'},
    [CardName.HARBINGER]: {Factory: Harbinger, compatibility: 'colonies'},
    [CardName.HERA]: {Factory: Hera},
    [CardName.HEYER_EDUCATION]: {Factory: HeyerEducation},
    [CardName.HYDRODYNAMICS]: {Factory: Hydrodynamics},
    [CardName.HYDROSOL]: {Factory: HydroSol},
    [CardName.LEVIATHAN]: {Factory: Leviathan},
    [CardName.LIANDRI_MINING_CORPORATION]: {Factory: LiandriMiningCorporation},
    [CardName.LOBOS_DEL_CIELO]: {Factory: LobosDelCielo, compatibility: 'venus'},
    [CardName.MARIN]: {Factory: Marin},
    [CardName.MARS_ACTIVE_RESOURCES]: {Factory: MarsActiveResources, compatibility: 'pathfinders'},
    [CardName.MARS_INCORPORATED]: {Factory: MarsIncorporated},
    [CardName.MICROMASS_SYSTEMS]: {Factory: MicroMassSystems},
    [CardName.MMBIO]: {Factory: MMBio},
    [CardName.O2]: {Factory: O2},
    [CardName.OLYMPIC_GALACTIC_CORPORATION]: {Factory: OlympicGalacticCorporation},
    [CardName.OMNI_CONSUMER_PRODUCTS]: {Factory: OmniConsumerProducts},
    [CardName.OPHIR_PLANUM_NURSERY_GARDENS]: {Factory: OphirPlanumNurseryGardens},
    [CardName.PALLAS]: {Factory: Pallas},
    [CardName.PETRIOLIUM]: {Factory: Petriolium},
    [CardName.PHOTO_SYNTHESISTS]: {Factory: PhotoSynthesists},
    [CardName.PLANETARY_HOMEOSTASIS_BUREAU]: {Factory: PlanetaryHomeostasisBureau},
    [CardName.PRG]: {Factory: PRG},
    [CardName.PROTOGEN]: {Factory: Protogen},
    [CardName.PSI_CORPS]: {Factory: PsiCorps},
    [CardName.PUR_N_KLEEN]: {Factory: PurNKleen},
    [CardName.RED_LIFE_PROJECT]: {Factory: RedLifeProject},
    [CardName.RED_SHIP]: {Factory: RedShip},
    [CardName.SCOLEX_INDUSTRIES]: {Factory: ScolexIndustries},
    [CardName.SHINRA_TECHNOLOGIES]: {Factory: ShinraTechnologies},
    [CardName.SIRENIA]: {Factory: Sirenia},
    [CardName.SOLAR_VOYAGER]: {Factory: SolarVoyager, compatibility: ['venus', 'mercury']},
    [CardName.SOUKAI_SYNDICATE]: {Factory: SoukaiSyndicate},
    [CardName.SYMBIOTIC_HEALTH_SYSTEMS]: {Factory: SymbioticHealthSystems},
    [CardName.SYMBIOTIC_SYSTEMS]: {Factory: SymbioticSystems, compatibility: 'venus'},
    [CardName.TEPCO]: {Factory: TEPCO, compatibility: 'nuclear'},
    [CardName.THE_PIGFARTS_INITIATIVE]: {Factory: ThePigfartsInitiative},
    [CardName.TROIDCO]: {Factory: Troidco},
    [CardName.UNDERSEC]: {Factory: UnderSec},
    [CardName.UNION_AEROSPACE]: {Factory: UnionAerospace},
    [CardName.VULCAN_FOUNDRIES]: {Factory: VulcanFoundries},
    [CardName.WEYLAND_YUTANI_CORP]: {Factory: WeylandYutaniCorp},
    // Batch 2
    [CardName.ACQUIRE_UNLIMITED]: {Factory: AcquireUnlimited},
    [CardName.ADVANCED_MINING_ASSOCIATION]: {Factory: AdvancedMiningAssociation, compatibility: 'pathfinders'},
    [CardName.AQUATECH_CORP]: {Factory: AquatechCorp},
    [CardName.ARES_SECURITY]: {Factory: AresSecurity},
    [CardName.ARES_TECHNOLOGY]: {Factory: AresTechnology, compatibility: 'turmoil'},
    [CardName.ARES_UNION]: {Factory: AresUnion},
    [CardName.ARIA]: {Factory: Aria},
    [CardName.ASTRA_MECHANIKA]: {Factory: AstraMechanika},
    [CardName.BLIZZCORP]: {Factory: Blizzcorp, compatibility: 'pathfinders'},
    [CardName.CHAANG_FUELS_INC]: {Factory: ChaangFuelsInc, compatibility: 'colonies'},
    [CardName.CHEAP_CHISPA]: {Factory: CheapChispa},
    [CardName.CLOUDMIND]: {Factory: Cloudmind},
    [CardName.COEURL_INDUSTRIES]: {Factory: CoeurlIndustries},
    [CardName.COLONIAL_ONE]: {Factory: ColonialOne, compatibility: 'colonies'},
    [CardName.DEV_WRIGHT]: {Factory: DevWright},
    [CardName.DUBAI_COLONY_INITIATIVE]: {Factory: DubaiColonyInitiative},
    [CardName.EARTH_FIRST]: {Factory: EarthFirst},
    [CardName.ETHER_ENTERPRISE]: {Factory: EtherEnterprise, compatibility: ['colonies', 'mercury']},
    [CardName.HERMETIC_ORDER_OF_MARS_EPIC]: {Factory: HermeticOrderOfMarsEpic, compatibility: 'pathfinders'},
    [CardName.IMPERIO_SOLAR_MARCIANO]: {Factory: ImperioSolarMarciano, compatibility: 'pathfinders'},
    [CardName.LAZARUS_LABORATORIES]: {Factory: LazarusLaboratories},
    [CardName.LOGOS_RESEARCH_AND_DEVELOPMENT]: {Factory: LogosResearchAndDevelopment},
    [CardName.MARABOUT_SHIRITORI]: {Factory: MaraboutShiritori},
    [CardName.NEPTUNE]: {Factory: Neptune},
    [CardName.NEW_TECH]: {Factory: NewTech},
    [CardName.NOJO]: {Factory: NOJO},
    [CardName.OASIS]: {Factory: Oasis},
    [CardName.OPPORTUNISTIC_CONSORTIUM]: {Factory: OpportunisticConsortium},
    [CardName.ORBITAL_EYE]: {Factory: OrbitalEye},
    [CardName.OUROBOROS]: {Factory: Ouroboros},
    [CardName.PATHFINDER]: {Factory: Pathfinder, compatibility: 'pathfinders'},
    [CardName.POLITICORP]: {Factory: PolitiCorp, compatibility: 'turmoil'},
    [CardName.PRINCESS_LTD]: {Factory: PrincessLtd},
    [CardName.SOLAR_ENTERPRISES]: {Factory: SolarEnterprises, compatibility: 'colonies'},
    [CardName.SPARTANS_SECURITY]: {Factory: SpartansSecurity},
    [CardName.TEO]: {Factory: TEO},
    [CardName.THERMEX]: {Factory: Thermex},
    [CardName.TOYITSU]: {Factory: Toyitsu},
    [CardName.TRUE_MARS_FOUNDATION]: {Factory: TrueMarsFoundation, compatibility: 'pathfinders'},
    [CardName.TWIN_CITIES_OF_HELIUM]: {Factory: TwinCitiesOfHelium},
  },
});
