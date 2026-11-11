import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class GreenCityLegislation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GREEN_CITY_LEGISLATION,
      tags: [Tag.MARS, Tag.POWER, Tag.CITY],
      cost: 35,
      requirements: {production: Resource.HEAT},
      behavior: {
        city: {},
        tr: 1,
        decreaseAnyProduction: {type: Resource.HEAT, count: 1},
        production: {megacredits: -1, energy: 2},
      },
      metadata: {
        cardNumber: 'E15',
        renderData: CardRenderer.builder((b) => {
          b.city().tr(1).br;
          b.production((pb) => pb.minus().heat(1, {all}).br.minus().megacredits(1).plus().energy(2));
        }),
        description: "Requires heat production. Place a city and raise your TR 1 step. Decrease any player's heat production 1 step, decrease your M\u20ac production 1 step, and increase your energy production 2 steps.",
      },
    });
  }
}
