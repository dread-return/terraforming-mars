import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {ICard} from '../ICard';
import {all} from '../Options';

export class FlyingCorsairs extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.FLYING_CORSAIRS,
      cost: 1,

      behavior: {
        removeResourcesFromAnyCard: {type: CardResource.FLOATER, count: 2, source: 'all'},
      },

      metadata: {
        cardNumber: 'I31',
        renderData: CardRenderer.builder((b) => {
          b.text('steal').resource(CardResource.FLOATER, {all}).nbsp.minus().resource(CardResource.FLOATER, {amount: 2, all});
        }),
        description: 'Steal a floater from any player. Remove 2 floaters from any player.',
      },
    });
  }

  private stealable(player: IPlayer): Array<ICard> {
    const result: Array<ICard> = [];
    for (const opponent of player.opponents) {
      for (const card of opponent.getCardsWithResources(CardResource.FLOATER)) {
        if (card.protectedResources !== true) {
          result.push(card);
        }
      }
    }
    return result;
  }

  public override bespokePlay(player: IPlayer) {
    const sources = this.stealable(player);
    const targets = player.getResourceCards(CardResource.FLOATER);
    if (sources.length === 0 || targets.length === 0) {
      return undefined;
    }
    return new SelectCard('Select a card to steal 1 floater from', 'Steal', sources, {showOwner: true})
      .andThen(([source]) => {
        const owner = player.game.getCardPlayerOrThrow(source.name);
        owner.removeResourceFrom(source, 1, {removingPlayer: player, log: true});
        if (targets.length === 1) {
          player.addResourceTo(targets[0], {qty: 1, log: true});
          return undefined;
        }
        return new SelectCard('Select a card to add the stolen floater to', 'Add floater', targets)
          .andThen(([target]) => {
            player.addResourceTo(target, {qty: 1, log: true});
            return undefined;
          });
      });
  }
}
