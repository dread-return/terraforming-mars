import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {Resource} from '../../../common/Resource';

export class Mothership extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MOTHERSHIP,
      tags: [Tag.SPACE],
      cost: 12,
      requirements: {tag: Tag.SPACE, count: 3},
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}, per: 3},

      metadata: {
        cardNumber: 'S44',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to add 1 fighter to each of up to 2 different cards.', (eb) => {
            eb.energy(1).startAction.resource(CardResource.FIGHTER).asterix().resource(CardResource.FIGHTER).asterix();
          }).br;
          b.vpText('1 VP for every 3 fighters on this card.');
        }),
        description: 'Requires 3 space tags.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.energy >= 1;
  }

  public action(player: IPlayer) {
    const cards = player.getResourceCards(CardResource.FIGHTER);
    player.stock.deduct(Resource.ENERGY, 1);
    if (cards.length === 1) {
      player.addResourceTo(cards[0], {qty: 1, log: true});
      return undefined;
    }
    return new SelectCard('Select up to 2 cards to add a fighter to', 'Add fighters', cards, {min: 1, max: 2})
      .andThen((selected) => {
        for (const card of selected) {
          player.addResourceTo(card, {qty: 1, log: true});
        }
        return undefined;
      });
  }
}
