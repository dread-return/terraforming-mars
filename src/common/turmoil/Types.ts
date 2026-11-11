import {PartyName} from './PartyName';

export type AgendaStyle =
  /** Use the standard policies and bonuses. */
  'Standard' |
  /** Randomly choose policies and bonuses, which remain for the entire game. */
  'Random' |
  /** The incoming chairman sets the incoming policy and bonus each generation. */
  'Chairman';

// Giga Turmoil parties: o = Spome, b = Bureaucrats, e = Empower, p = Populists, c = Centrists, t = Transhumanists.
const PARTIES = ['m', 's', 'u', 'k', 'r', 'g', 'o', 'b', 'e', 'p', 'c', 't'] as const;
const BONUS_SUFFIXES = ['b01', 'b02'] as const;
const POLICY_SUFFIXES = ['p01', 'p02', 'p03', 'p04'] as const;

type Party = typeof PARTIES[number];
type BonusSuffix = typeof BONUS_SUFFIXES[number]
type PolicySuffix = typeof POLICY_SUFFIXES[number];

export type BonusId = `${Party}${BonusSuffix}`;
export type PolicyId = `${Party}${PolicySuffix}`

/* A party's policy (and ruling bonus). Can vary based on the agenda style. */
export type Agenda = {
  bonusId: BonusId;
  policyId: PolicyId;
}

// Giga Turmoil parties only have two policies each.
const GIGA_PARTY_LETTERS: ReadonlyArray<Party> = ['o', 'b', 'e', 'p', 'c', 't'];
const GIGA_POLICY_SUFFIXES: ReadonlyArray<PolicySuffix> = ['p01', 'p02'];

export const BONUS_IDS: ReadonlyArray<BonusId> = PARTIES.flatMap((p) => BONUS_SUFFIXES.map((s) => `${p}${s}` as BonusId));
export const POLICY_IDS: ReadonlyArray<PolicyId> = PARTIES.flatMap((p) => {
  const suffixes = GIGA_PARTY_LETTERS.includes(p) ? GIGA_POLICY_SUFFIXES : POLICY_SUFFIXES;
  return suffixes.map((s) => `${p}${s}` as PolicyId);
});

/** When player has Mars Frontier Alliance, this is their political party alliance. */
export type AlliedParty = {
  partyName: PartyName;
  agenda: Agenda;
};

const names: Record<Party, PartyName> = {
  m: PartyName.MARS,
  s: PartyName.SCIENTISTS,
  u: PartyName.UNITY,
  k: PartyName.KELVINISTS,
  r: PartyName.REDS,
  g: PartyName.GREENS,
  o: PartyName.SPOME,
  b: PartyName.BUREAUCRATS,
  e: PartyName.EMPOWER,
  p: PartyName.POPULISTS,
  c: PartyName.CENTRISTS,
  t: PartyName.TRANSHUMANISTS,
} as const;

export type AgendaInfo = {
  name: PartyName;
  type: 'Bonus' | 'Policy';
  num: string;
};

export function agendaInfoById(id: BonusId | PolicyId): AgendaInfo {
  const p = id[0] as Party;
  const type: 'Bonus' | 'Policy' = id[1] === 'b' ? 'Bonus' : 'Policy';
  const num = id.substring(2);
  const name = names[p];
  return {name, type, num};
}

export function agendaIdDescription(id: BonusId | PolicyId): string {
  const info = agendaInfoById(id);
  return `${info.name} ${info.type} ${info.num}`;
}
