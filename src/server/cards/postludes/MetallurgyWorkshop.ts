import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';

export class MetallurgyWorkshop extends PostludeCard {
  constructor() {
    super({
      name: CardName.METALLURGY_WORKSHOP,
      type: CardType.ACTIVE,
      cost: 9,
      tags: [Tag.SCIENCE, Tag.SPACE],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L10',
        renderData: CardRenderer.builder((b) => {
          b.effect('You can use titanium to pay for adjacent tiles as if they were space cards.', (eb) => eb.emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.titanium(1).colon().megacredits(3));
        }),
        description: 'Place the Metallurgy Workshop tile on top of one of your cities. Effect: you can use titanium to pay for tiles placed adjacent to it, as if they were space cards.',
      },
    });
  }
}
