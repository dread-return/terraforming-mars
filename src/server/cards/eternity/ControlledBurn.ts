import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class ControlledBurn extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CONTROLLED_BURN,
      tags: [Tag.PLANT],
      cost: 8,
      requirements: {greeneries: 2, all: true},
      behavior: {
        production: {plants: -1, heat: 2},
        global: {temperature: 1},
      },
      metadata: {
        cardNumber: 'E58',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().plants(1).plus().heat(2)).br.minus().oxygen(1).temperature(1);
        }),
        description: 'Requires 2 greeneries in play. Decrease your plant production 1 step and increase your heat production 2 steps. Lower oxygen 1 step. Raise the temperature 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.increaseOxygenLevel(player, -1);
    return undefined;
  }
}
