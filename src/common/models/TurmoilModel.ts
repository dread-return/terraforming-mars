import {Color} from '../Color';
import {PartyName} from '../turmoil/PartyName';
import {GlobalEventName} from '../turmoil/globalEvents/GlobalEventName';
import {Agenda} from '../turmoil/Types';
export type TurmoilModel = {
  dominant: PartyName | undefined;
  ruling: PartyName | undefined;
  chairman: Color | undefined;
  parties: Array<PartyModel>;
  lobby: Array<Color>;
  reserve: Array<DelegatesModel>;
  distant: GlobalEventName | undefined;
  coming: GlobalEventName | undefined;
  current: GlobalEventName | undefined;
  politicalAgendas: PoliticalAgendasModel | undefined;
  policyActionUsers: Array<PolicyUser>;
}

export type PolicyUser = {
  color: Color;
  turmoilPolicyActionUsed: boolean;
  politicalAgendasActionUsedCount: number;
}

export type PartyModel = {
  name: PartyName;
  partyLeader: Color | undefined;
  delegates: Array<DelegatesModel>;
}

export type DelegatesModel = {
  color: Color;
  number: number;
}

/**
 * The agenda of each party in play. Only the parties in this game are present: in a standard game that is the six
 * official parties, with Giga Turmoil it is six of the twelve.
 */
export type PoliticalAgendasModel = {
  marsFirst?: Agenda;
  scientists?: Agenda;
  unity?: Agenda;
  greens?: Agenda;
  reds?: Agenda;
  kelvinists?: Agenda;
  spome?: Agenda;
  bureaucrats?: Agenda;
  empower?: Agenda;
  populists?: Agenda;
  centrists?: Agenda;
  transhumanists?: Agenda;
}

/** Which field of PoliticalAgendasModel holds the agenda of each party. */
export const PARTY_AGENDA_KEYS: Record<PartyName, keyof PoliticalAgendasModel> = {
  [PartyName.MARS]: 'marsFirst',
  [PartyName.SCIENTISTS]: 'scientists',
  [PartyName.UNITY]: 'unity',
  [PartyName.GREENS]: 'greens',
  [PartyName.REDS]: 'reds',
  [PartyName.KELVINISTS]: 'kelvinists',
  [PartyName.SPOME]: 'spome',
  [PartyName.BUREAUCRATS]: 'bureaucrats',
  [PartyName.EMPOWER]: 'empower',
  [PartyName.POPULISTS]: 'populists',
  [PartyName.CENTRISTS]: 'centrists',
  [PartyName.TRANSHUMANISTS]: 'transhumanists',
};
