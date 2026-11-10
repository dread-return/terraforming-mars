import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class TerraformLobbyism extends PreludeCard {
  constructor() {
    super({
      name: CardName.TERRAFORM_LOBBYISM,
      tags: [Tag.EARTH, Tag.SCIENCE],
      behavior: {
        drawCard: {count: 2, tag: Tag.EARTH},
        tr: 1,
        stock: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'EP59',
        renderData: CardRenderer.builder((b) => {
          b.cards(2, {secondaryTag: Tag.EARTH}).tr(1).megacredits(3);
        }),
        description: 'Reveal cards until you reveal 2 Earth cards; take them and shuffle the rest back. Raise your TR 1 step. Gain 3 M\u20ac.',
      },
    });
  }
}
