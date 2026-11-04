import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class HeavyMachinery extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HEAVY_MACHINERY,
      tags: [],
      cost: 6,
      requirements: {tag: Tag.BUILDING},

      action: {
        spend: {megacredits: 11},
        production: {titanium: 1},
      },

      metadata: {
        cardNumber: 'H56',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 11 M€ to increase your titanium production 1 step.', (eb) => {
            eb.megacredits(11).startAction.production((pb) => pb.titanium(1));
          }).br;
          b.effect('The City standard project costs 1 M€ less.', (eb) => {
            eb.city().slash().specialTile().startEffect.megacredits(-1);
          });
        }),
        description: 'Requires a building tag.',
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    return card.name === CardName.CITY_STANDARD_PROJECT ? 1 : 0;
  }
}
