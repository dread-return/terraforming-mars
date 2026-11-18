import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {SendDelegateToArea} from '../../deferredActions/SendDelegateToArea';

/** S40. */
export class ImmigrationBureau extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.IMMIGRATION_BUREAU,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 9,
      requirements: {party: PartyName.POPULISTS},

      metadata: {
        cardNumber: 'S40',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play an Earth event, gain 3 M€ and add a delegate to any party.', (eb) => {
            eb.tag(Tag.EARTH).tag(Tag.EVENT).startEffect.megacredits(3).delegates(1);
          });
        }),
        description: 'Requires that Populists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type !== CardType.EVENT || !card.tags.includes(Tag.EARTH)) {
      return undefined;
    }
    player.stock.add(Resource.MEGACREDITS, 3, {log: true});
    if (player.game.turmoil?.delegateReserve.has(player)) {
      player.game.defer(new SendDelegateToArea(player));
    }
    return undefined;
  }
}
