import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard, ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';
import {all} from '../Options';

export class RelativisticHalfLife extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.RELATIVISTIC_HALF_LIFE,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 8,
      requirements: {production: Resource.STEEL, count: 1},
      behavior: {drawCard: 1},

      metadata: {
        cardNumber: 'N54',
        renderData: CardRenderer.builder((b) => {
          b.action('Remove X radiation from any card to gain X M€ and X-1 steel.', (eb) => {
            eb.text('X').resource(CardResource.RADIATION, {all}).startAction.text('X').megacredits(1).slash().text('X-1').steel(1);
          }).br;
          b.cards(1);
        }),
        description: 'Requires that you have steel production. Draw a card.',
      },
    });
  }

  private cardsWithRadiation(player: IPlayer): Array<{card: ICard, owner: IPlayer}> {
    const result: Array<{card: ICard, owner: IPlayer}> = [];
    for (const owner of player.game.players) {
      for (const card of owner.getCardsWithResources(CardResource.RADIATION)) {
        result.push({card, owner});
      }
    }
    return result;
  }

  public canAct(player: IPlayer): boolean {
    return this.cardsWithRadiation(player).length > 0;
  }

  public action(player: IPlayer) {
    const targets = this.cardsWithRadiation(player);
    return new SelectCard('Select a card to remove radiation from', 'Remove radiation', targets.map((t) => t.card))
      .andThen(([card]) => {
        const target = targets.find((t) => t.card.name === card.name);
        if (target === undefined) {
          throw new Error('Card not found');
        }
        return new SelectAmount('Select how many radiation to remove', 'Remove', 1, card.resourceCount, true)
          .andThen((amount) => {
            target.owner.removeResourceFrom(card, amount, {removingPlayer: player, log: true});
            player.stock.add(Resource.MEGACREDITS, amount, {log: true});
            if (amount > 1) {
              player.stock.add(Resource.STEEL, amount - 1, {log: true});
            }
            return undefined;
          });
      });
  }
}
