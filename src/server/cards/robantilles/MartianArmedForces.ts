import {uppercase} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class MartianArmedForces extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_ARMED_FORCES,
      tags: [Tag.EARTH],
      cost: 13,
      victoryPoints: 2,

      metadata: {
        cardNumber: 'H16',
        renderData: CardRenderer.builder((b) => {
          b.text('Opponents may not remove your', {size: Size.SMALL, uppercase}).br;
          b.megacredits(1).steel(1).titanium(1);
        }),
      },
    });
  }
}
