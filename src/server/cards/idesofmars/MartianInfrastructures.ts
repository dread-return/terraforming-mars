import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

const TILE_PROJECTS: ReadonlyArray<CardName> = [
  CardName.CITY_STANDARD_PROJECT,
  CardName.GREENERY_STANDARD_PROJECT,
  CardName.AQUIFER_STANDARD_PROJECT,
];

export class MartianInfrastructures extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_INFRASTRUCTURES,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 6,

      behavior: {
        production: {energy: -1},
      },

      metadata: {
        cardNumber: 'I29',
        renderData: CardRenderer.builder((b) => {
          b.effect('Card actions and standard projects that place a tile on Mars cost 2 M€ less.', (eb) => {
            eb.emptyTile().asterix().startEffect.megacredits(-2);
          }).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Decrease your energy production 1 step.',
      },
    });
  }

  // Card actions get the discount in the behavior executor (see IdesOfMars.actionMegacredits).
  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    return TILE_PROJECTS.includes(card.name) ? 2 : 0;
  }
}
