import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';

export class MachineryFactory extends PostludeCard {
  constructor() {
    super({
      name: CardName.MACHINERY_FACTORY,
      type: CardType.ACTIVE,
      cost: 3,
      tags: [Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L07',
        renderData: CardRenderer.builder((b) => {
          b.effect('You can use steel to pay for adjacent tiles as if they were buildings.', (eb) => eb.emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.steel(1).colon().megacredits(2));
        }),
        description: 'Place the Machinery Factory tile on top of one of your cities. Effect: you can use steel to pay for tiles placed adjacent to it, as if they were buildings.',
      },
    });
  }
}
