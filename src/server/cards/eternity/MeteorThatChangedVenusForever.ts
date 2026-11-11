import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Tag} from '../../../common/cards/Tag';

export class MeteorThatChangedVenusForever extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.METEOR_THAT_CHANGED_VENUS_FOREVER,
      tags: [Tag.VENUS, Tag.SPACE],
      cost: 19,
      behavior: {
        global: {venus: 2},
      },
      metadata: {
        cardNumber: 'E29',
        renderData: CardRenderer.builder((b) => {
          b.venus(2).br.minus().resource(CardResource.FLOATER).slash().cards(1, {secondaryTag: Tag.VENUS}).asterix();
        }),
        description: 'Raise Venus 2 steps. Discard up to 2 cards. For each card discarded, remove 1 floater from each card in play with a Venus tag.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    if (player.cardsInHand.length === 0) {
      return undefined;
    }
    player.defer(new SelectCard('Discard up to 2 cards', 'Discard', player.cardsInHand, {min: 0, max: Math.min(2, player.cardsInHand.length)}).andThen((cards) => {
      for (const c of cards) {
        player.discardCardFromHand(c, {log: true});
      }
      cards.forEach(() => {
        for (const p of player.game.players) {
          for (const card of p.getResourceCards(CardResource.FLOATER)) {
            if (card.tags.includes(Tag.VENUS) && card.resourceCount > 0) {
              p.removeResourceFrom(card, 1, {removingPlayer: player, log: true});
            }
          }
        }
      });
      return undefined;
    }));
    return undefined;
  }
}
