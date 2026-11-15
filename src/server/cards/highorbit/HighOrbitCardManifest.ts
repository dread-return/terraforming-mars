import {CardName} from '../../../common/cards/CardName';
import {infrastructureDesign} from '../../../common/highOrbit/HighOrbit';
import {CardManifest, ModuleManifest} from '../ModuleManifest';
import {IProjectCard} from '../IProjectCard';
import {AsteroidMine} from './AsteroidMine';
import {AutoFactory} from './AutoFactory';
import {Comsat} from './Comsat';
import {Freighter} from './Freighter';
import {Hydroponics} from './Hydroponics';
import {NavigationalBeacon} from './NavigationalBeacon';
import {Observatory} from './Observatory';
import {OrbitalHeadquarters} from './OrbitalHeadquarters';
import {OrbitalShipyard} from './OrbitalShipyard';
import {PlanetaryOutpost} from './PlanetaryOutpost';
import {Powersat} from './Powersat';
import {Probe} from './Probe';
import {PropellantDepot} from './PropellantDepot';
import {SalvageDepot} from './SalvageDepot';
import {ScienceFacility} from './ScienceFacility';
import {SpaceHabitat} from './SpaceHabitat';
import {SpaceTradingStation} from './SpaceTradingStation';
import {WeatherSatellite} from './WeatherSatellite';
import {LagrangeCollective} from './LagrangeCollective';
import {PlanetaryEngineeringCorps} from './PlanetaryEngineeringCorps';
import {TrojanSpaceLogistics} from './TrojanSpaceLogistics';
import {Spacetek} from './Spacetek';
import {JudgesOfChange} from './JudgesOfChange';

type InfrastructureClass = new (copy: number) => IProjectCard;

const INFRASTRUCTURE_CLASSES: Array<[CardName, InfrastructureClass]> = [
  [CardName.COMSAT, Comsat],
  [CardName.WEATHER_SATELLITE, WeatherSatellite],
  [CardName.POWERSAT, Powersat],
  [CardName.PROBE, Probe],
  [CardName.OBSERVATORY, Observatory],
  [CardName.NAVIGATIONAL_BEACON, NavigationalBeacon],
  [CardName.ASTEROID_MINE, AsteroidMine],
  [CardName.AUTO_FACTORY, AutoFactory],
  [CardName.PROPELLANT_DEPOT, PropellantDepot],
  [CardName.FREIGHTER, Freighter],
  [CardName.SALVAGE_DEPOT, SalvageDepot],
  [CardName.SPACE_TRADING_STATION, SpaceTradingStation],
  [CardName.ORBITAL_HEADQUARTERS, OrbitalHeadquarters],
  [CardName.ORBITAL_SHIPYARD, OrbitalShipyard],
  [CardName.SCIENCE_FACILITY, ScienceFacility],
  [CardName.HYDROPONICS, Hydroponics],
  [CardName.SPACE_HABITAT, SpaceHabitat],
  [CardName.PLANETARY_OUTPOST, PlanetaryOutpost],
];

/**
 * Every numbered copy of every infrastructure. They are never shuffled into a deck (`instantiate: false`);
 * HighOrbit.buy creates them by name.
 */
function infrastructureCards(): CardManifest<IProjectCard> {
  const manifest: CardManifest<IProjectCard> = {};
  for (const [base, Klass] of INFRASTRUCTURE_CLASSES) {
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
