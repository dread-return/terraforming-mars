import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class EarthsLastCityRebuilt extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.EARTHS_LAST_CITY_REBUILT,
      tags: [Tag.MARS, Tag.EARTH, Tag.CITY],
      cost: 37,
      requirements: {cities: 2, all: true},
      victoryPoints: {tag: Tag.CITY},
      behavior: {
        city: {},
      },
      action: {
        stock: {megacredits: 7},
      },
      metadata: {
        cardNumber: 'E66',
        renderData: CardRenderer.builder((b) => {
          b.effect('You can’t play city-tag cards.', (eb) => eb.tag(Tag.CITY).startEffect.text('X'));
          b.br;
          b.action('Gain 7 M€.', (eb) => eb.empty().startAction.megacredits(7)).br;
          b.city();
        }),
      },
    });
  }
}
