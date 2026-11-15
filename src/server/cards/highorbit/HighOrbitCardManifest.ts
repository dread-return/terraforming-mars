import {CardName} from '../../../common/cards/CardName';
import {infrastructureDesign} from '../../../common/highOrbit/HighOrbit';
import {CardManifest, ModuleManifest} from '../ModuleManifest';
import {IProjectCard} from '../IProjectCard';
import {Expansion} from '../../../common/cards/GameModule';
import {AsteroidMine} from './AsteroidMine';
import {AsteroidOutpost} from './AsteroidOutpost';
import {AutoFactory} from './AutoFactory';
import {Comsat} from './Comsat';
import {Freighters} from './Freighters';
import {Hydroponics} from './Hydroponics';
import {Moonsat, VenusSat} from './PlanetSatellite';
import {NavigationalBeacon} from './NavigationalBeacon';
import {Observatory} from './Observatory';
import {OrbitalHeadquarters} from './OrbitalHeadquarters';
import {OrbitalShipyard} from './OrbitalShipyard';
import {PowersatStation} from './PowersatStation';
import {Probe} from './Probe';
import {PropellantDepot} from './PropellantDepot';
import {SalvageDepot} from './SalvageDepot';
import {ScienceFacility} from './ScienceFacility';
import {SpaceHabitat} from './SpaceHabitat';
import {SpaceTradingStation} from './SpaceTradingStation';
import {Spysat} from './Spysat';
import {WeatherSatellite} from './WeatherSatellite';
import {LagrangeCollective} from './LagrangeCollective';
import {PlanetaryEngineeringCorps} from './PlanetaryEngineeringCorps';
import {TrojanSpaceLogistics} from './TrojanSpaceLogistics';
import {Spacetek} from './Spacetek';
import {JudgesOfChange} from './JudgesOfChange';

type InfrastructureClass = new (copy: number) => IProjectCard;

const INFRASTRUCTURE_CLASSES: Array<[CardName, InfrastructureClass, Expansion?]> = [
  // Satellites
  [CardName.COMSAT, Comsat, 'colonies'],
  [CardName.MOONSAT, Moonsat, 'moon'],
  [CardName.NAVIGATIONAL_BEACON, NavigationalBeacon],
  [CardName.PROBE, Probe],
  [CardName.SPYSAT, Spysat],
  [CardName.VENUS_SAT, VenusSat, 'venus'],
  [CardName.WEATHER_SATELLITE, WeatherSatellite],
  // Ore-producing
  [CardName.ASTEROID_MINE, AsteroidMine],
  [CardName.AUTO_FACTORY, AutoFactory],
  [CardName.FREIGHTERS, Freighters, 'colonies'],
  [CardName.ORBITAL_SHIPYARD, OrbitalShipyard],
  [CardName.PROPELLANT_DEPOT, PropellantDepot],
  [CardName.SALVAGE_DEPOT, SalvageDepot],
  [CardName.SPACE_TRADING_STATION, SpaceTradingStation],
  // Advanced
  [CardName.ASTEROID_OUTPOST, AsteroidOutpost],
  [CardName.HYDROPONICS, Hydroponics],
  [CardName.OBSERVATORY, Observatory],
  [CardName.ORBITAL_HEADQUARTERS, OrbitalHeadquarters],
  [CardName.POWERSAT_STATION, PowersatStation],
  [CardName.SCIENCE_FACILITY, ScienceFacility],
  [CardName.SPACE_HABITAT, SpaceHabitat],
];

/**
 * Every numbered copy of every infrastructure. They are never shuffled into a deck (`instantiate: false`);
 * HighOrbit.buy creates them by name.
 */
function infrastructureCards(): CardManifest<IProjectCard> {
  const manifest: CardManifest<IProjectCard> = {};
  for (const [base, Klass, compatibility] of INFRASTRUCTURE_CLASSES) {
    const design = infrastructureDesign(base);
    if (design === undefined) {
      throw new Error(`${base} is not an infrastructure`);
    }
    design.copies.forEach((name, idx) => {
      const copy = idx + 1;
      manifest[name] = {
        Factory: class extends Klass {
          constructor() {
            super(copy);
          }
        },
        instantiate: false,
        // Shows the expansion badge in the card list. Which stacks are dealt is decided by HighOrbit.newState.
        compatibility,
      };
    });
  }
  return manifest;
}

export const HIGH_ORBIT_CARD_MANIFEST = new ModuleManifest({
  module: 'highorbit',
  projectCards: infrastructureCards(),
  corporationCards: {
    [CardName.LAGRANGE_COLLECTIVE]: {Factory: LagrangeCollective},
    [CardName.PLANETARY_ENGINEERING_CORPS]: {Factory: PlanetaryEngineeringCorps},
    [CardName.TROJAN_SPACE_LOGISTICS]: {Factory: TrojanSpaceLogistics},
    [CardName.SPACETEK]: {Factory: Spacetek},
    [CardName.JUDGES_OF_CHANGE]: {Factory: JudgesOfChange},
  },
});
