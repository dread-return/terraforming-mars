import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class SteelCityOnMars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STEEL_CITY_ON_MARS,
      tags: [Tag.CITY, Tag.MARS, Tag.BUILDING],
      cost: 7,
      requirements: {display: 'maxOneEarthVenusJovian'},
      behavior: {
        production: {energy: -2, megacredits: 3, steel: 1},
        city: {},
      },
      metadata: {
        cardNumber: 'E121',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(2).br.plus().megacredits(3).steel(1)).city();
        }),
        description: 'You may have no more than one Earth, Venus or Jovian tag. Decrease your energy production 2 steps. Increase your M\u20ac production 3 steps and your steel production 1 step. Place a city.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.tags.count(Tag.EARTH, 'raw') + player.tags.count(Tag.VENUS, 'raw') + player.tags.count(Tag.JOVIAN, 'raw') <= 1;
  }
}
