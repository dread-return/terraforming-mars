import {INFRASTRUCTURE_DESIGNS} from '../../common/highOrbit/HighOrbit';
import {CardName} from '../../common/cards/CardName';

export class MoonCards {
  public static scienceCardsWithLessThan2VP: ReadonlySet<CardName> = new Set([
    CardName.OLYMPUS_CONFERENCE,
    CardName.MINING_CONVERSION_TECHNOLOGY, // Eternity
    CardName.COPERNICUS_TOWER,
    CardName.LUNA_ARCHIVES,
    CardName.PRIDE_OF_THE_EARTH_ARKSHIP,
    CardName.NANOTECH_INDUSTRIES,
    CardName.APPLIED_SCIENCE,
    CardName.SPIRE,
    // High Orbit (every copy of the silver cards).
    ...INFRASTRUCTURE_DESIGNS
      .filter((d) => d.name === CardName.OBSERVATORY || d.name === CardName.PROBE || d.name === CardName.SCIENCE_FACILITY)
      .flatMap((d) => d.copies),
    CardName.JUDGES_OF_CHANGE,
    // Epic Corporations
    CardName.HEYER_EDUCATION,
  ]);
}
