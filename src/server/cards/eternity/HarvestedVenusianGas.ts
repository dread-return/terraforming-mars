import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class HarvestedVenusianGas extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HARVESTED_VENUSIAN_GAS,
      tags: [Tag.VENUS],
      cost: 45,
      resourceType: CardResource.FLOATER,
      requirements: {venus: 10},
      victoryPoints: {resourcesHere: {}, per: 2},
      behavior: {
        production: {energy: 1, heat: 1},
      },
      metadata: {
        cardNumber: 'E16',
        renderData: CardRenderer.builder((b) => {
          b.effect('When anyone plays a Venus tag (incl. this): 1 floater here, 2 M€, draw a card.', (eb) => {
            eb.tag(Tag.VENUS, {all}).startEffect.resource(CardResource.FLOATER).megacredits(2).cards(1);
          }).br;
          b.production((pb) => pb.energy(1).heat(1));
        }),
        description: 'Requires 10% Venus. Increase your energy and heat production 1 step.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(owner: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.VENUS).length;
    if (n > 0) {
      owner.addResourceTo(this, {qty: n, log: true});
      owner.stock.add(Resource.MEGACREDITS, 2 * n, {log: true});
      owner.drawCard(n);
    }
  }
}
