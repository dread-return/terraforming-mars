import {Color} from '../../common/Color';
import {IGame} from '../IGame';
import {PoliticalAgendas} from '../turmoil/PoliticalAgendas';
import {Delegate, Turmoil} from '../turmoil/Turmoil';
import {DelegatesModel, PARTY_AGENDA_KEYS, PartyModel, PoliticalAgendasModel, TurmoilModel} from '../../common/models/TurmoilModel';

export function getTurmoilModel(game: IGame): TurmoilModel | undefined {
  const turmoil = game.turmoil;
  if (!turmoil) {
    return undefined;
  }
  const parties = getParties(turmoil);
  let chairman: Color | undefined;

  if (turmoil.chairman) {
    chairman = delegateColor(turmoil.chairman);
  }
  const dominant = turmoil.dominantParty.name;
  const ruling = turmoil.rulingParty.name;

  const reserve: Array<DelegatesModel> = [];
  const lobby: Array<Color> = [];
  turmoil.delegateReserve.forEachMultiplicity((count, delegate) => {
    const color = delegateColor(delegate);
    if (delegate !== 'NEUTRAL') {
      if (!turmoil.usedFreeDelegateAction.has(delegate)) {
        count--;
        lobby.push(color);
      }
    }
    reserve.push({
      color: color,
      number: count,
    });
  });

  const politicalAgendas: PoliticalAgendasModel = {};
  for (const party of turmoil.parties) {
    politicalAgendas[PARTY_AGENDA_KEYS[party.name]] = PoliticalAgendas.getAgenda(turmoil, party.name);
  }

  const policyActionUsers = Array.from(
    game.playersInGenerationOrder,
    (player) => {
      return {
        color: player.color,
        turmoilPolicyActionUsed: player.turmoilPolicyActionUsed,
        politicalAgendasActionUsedCount: player.politicalAgendasActionUsedCount};
    },
  );

  return {
    chairman,
    ruling,
    dominant,
    parties,
    lobby,
    reserve,
    distant: turmoil.distantGlobalEvent?.name,
    coming: turmoil.comingGlobalEvent?.name,
    current: turmoil.currentGlobalEvent?.name,
    politicalAgendas,
    policyActionUsers,
  };
}

function getParties(turmoil: Turmoil): Array<PartyModel> {
  return turmoil.parties.map(function(party) {
    const delegates: Array<DelegatesModel> = [];
    for (const player of party.delegates.keys()) {
      const number = party.delegates.count(player);
      delegates.push({
        color: delegateColor(player),
        number,
      });
    }
    const partyLeader = party.partyLeader === undefined ? undefined : delegateColor(party.partyLeader);
    return {
      name: party.name,
      partyLeader: partyLeader,
      delegates: delegates,
    };
  });
}

function delegateColor(delegate: Delegate) {
  return delegate === 'NEUTRAL' ? 'neutral' : delegate.color;
}
