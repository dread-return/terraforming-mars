import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {resource} from '../render/DynamicVictoryPoints';

export class OpeningOfNaturalReserves extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.OPENING_OF_NATURAL_RESERVES,
      tags: [Tag.ANIMAL],
      cost: 12,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'H39',
        renderData: CardRenderer.builder((b) => {
          b.vpText('1 VP for every 4 animals on your other cards.');
        }),
        victoryPoints: resource(CardResource.ANIMAL, 1, 4),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return Math.floor(player.getResourceCount(CardResource.ANIMAL) / 4);
  }
}
