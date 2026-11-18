import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Turmoil} from '../../turmoil/Turmoil';
import {SelectParty} from '../../inputs/SelectParty';

/** S36. Two delegates from your reserve, in two different parties. */
export class FirstManMonument extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FIRST_MAN_MONUMENT,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 6,
      victoryPoints: 1,
      requirements: {party: PartyName.CENTRISTS},

      metadata: {
        cardNumber: 'S36',
        renderData: CardRenderer.builder((b) => {
          b.delegates(1).nbsp.delegates(1).asterix();
        }),
        description: 'Requires that Centrists are ruling or that you have 2 delegates there. Add 1 delegate to a party, then 1 delegate to a different party.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const turmoil = Turmoil.getTurmoil(game);
    const send = (exclude: PartyName | undefined) => {
      if (!turmoil.delegateReserve.has(player)) {
        return undefined;
      }
      const parties = turmoil.parties.map((p) => p.name).filter((name) => name !== exclude);
      return new SelectParty('Select where to send a delegate', 'Send delegate', parties).andThen((partyName) => {
        turmoil.sendDelegateToParty(player, partyName, game);
        game.log('/bin/bash sent a delegate in  area', (b) => b.player(player).partyName(partyName));
        if (exclude === undefined) {
          player.defer(() => send(partyName));
        }
        return undefined;
      });
    };
    return send(undefined);
  }
}
