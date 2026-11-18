import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Turmoil} from '../../turmoil/Turmoil';
import {IParty} from '../../turmoil/parties/IParty';
import {SelectParty} from '../../inputs/SelectParty';

/**
 * S19. The leader of a party steps down to an ordinary delegate and one of your delegates becomes its
 * leader: a delegate from your reserve if you have one, otherwise one you already have in that party.
 */
export class Plebiscite extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.PLEBISCITE,
      tags: [Tag.EARTH],
      cost: 3,
      requirements: {party: PartyName.POPULISTS},

      metadata: {
        cardNumber: 'S19',
        renderData: CardRenderer.builder((b) => {
          b.text('Replace a party leader with one of your delegates. The old leader stays as a delegate.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Populists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public static eligibleParties(player: IPlayer): Array<IParty> {
    const turmoil = Turmoil.getTurmoil(player.game);
    const inReserve = turmoil.delegateReserve.has(player);
    return turmoil.parties.filter((party) =>
      party.partyLeader !== undefined && party.partyLeader !== player &&
      (inReserve || party.delegates.get(player) > 0));
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.turmoil !== undefined && Plebiscite.eligibleParties(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const turmoil = Turmoil.getTurmoil(game);
    const parties = Plebiscite.eligibleParties(player);
    return new SelectParty('Select the party whose leader you replace', 'Replace', parties.map((p) => p.name))
      .andThen((partyName) => {
        const party = turmoil.getPartyByName(partyName);
        if (turmoil.delegateReserve.has(player)) {
          turmoil.delegateReserve.remove(player);
          party.delegates.add(player);
        }
        party.partyLeader = player;
        game.log('/bin/bash became the leader of ', (b) => b.player(player).party(party));
        return undefined;
      });
  }
}
