import {CardName} from '../../../common/cards/CardName';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {productionOf} from '../render/DynamicVictoryPoints';

export class UrbanizationIncentives extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.URBANIZATION_INCENTIVES,
      tags: [Tag.CITY, Tag.POWER],
      cost: 22,
      victoryPoints: 'special',
      behavior: {
        city: {},
        tr: -1,
        production: {plants: -1, energy: 4},
      },
      metadata: {
        cardNumber: 'E136',
        victoryPoints: productionOf(CardRenderItemType.ENERGY, -1, 1),
        renderData: CardRenderer.builder((b) => {
          b.city().minus().tr(1).br.production((pb) => pb.minus().plants(1).plus().energy(4));
        }),
        description: 'Place a city. Lower your TR 1 step. Decrease your plant production 1 step and increase your energy production 4 steps. -1 VP per energy production you have.',
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return -player.production.energy;
  }
}
