import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class LavaCaverns extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.LAVA_CAVERNS,
      tags: [],
      cost: 16,
      victoryPoints: 1,
      behavior: {
        production: {heat: 1},
      },
      metadata: {
        cardNumber: 'E82',
        renderData: CardRenderer.builder((b) => {
          b.effect('Anyone plays an event: +2 M€.', (eb) => eb.tag(Tag.EVENT, {all}).startEffect.megacredits(2)).br;
          b.effect('You raise temperature: +2 M€.', (eb) => eb.temperature(1).startEffect.megacredits(2)).br;
          b.production((pb) => pb.heat(1));
        }),
        description: 'Increase your heat production 1 step.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(owner: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT) {
      owner.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter) {
    if (parameter === GlobalParameter.TEMPERATURE) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
}
