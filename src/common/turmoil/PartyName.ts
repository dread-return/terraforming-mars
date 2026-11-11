export enum PartyName {
    MARS = 'Mars First',
    SCIENTISTS = 'Scientists',
    UNITY = 'Unity',
    KELVINISTS = 'Kelvinists',
    REDS = 'Reds',
    GREENS = 'Greens',
    // Giga Turmoil parties (only in games that use Giga Turmoil).
    SPOME = 'Spome',
    BUREAUCRATS = 'Bureaucrats',
    EMPOWER = 'Empower',
    POPULISTS = 'Populists',
    CENTRISTS = 'Centrists',
    TRANSHUMANISTS = 'Transhumanists',
}

/** The six parties of the base Turmoil expansion. */
export const OFFICIAL_PARTIES: ReadonlyArray<PartyName> = [
  PartyName.MARS,
  PartyName.SCIENTISTS,
  PartyName.UNITY,
  PartyName.GREENS,
  PartyName.REDS,
  PartyName.KELVINISTS,
];

/** The six extra parties added by Giga Turmoil. */
export const GIGA_PARTIES: ReadonlyArray<PartyName> = [
  PartyName.SPOME,
  PartyName.BUREAUCRATS,
  PartyName.EMPOWER,
  PartyName.POPULISTS,
  PartyName.CENTRISTS,
  PartyName.TRANSHUMANISTS,
];

/** Giga Turmoil plays with this many parties, drawn from the 12 available. */
export const GIGA_PARTIES_IN_PLAY = 6;
