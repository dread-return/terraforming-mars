import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class SmallSpaceElevator extends ActCard {
  constructor() {
    super({
      name: CardName.SMALL_SPACE_ELEVATOR,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.MARS, Tag.BUILDING],
      victoryBehavior: {stock: {steel: 5}},
      defeatBehavior: {tr: -1},
      metadata: {
        cardNumber: 'ACT55',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).steel(5, {digit}).br.text('defeat:', {size: Size.SMALL}).minus().tr(1);
        }),
        description: 'Victory: receive 5 steel. Defeat: -1 TR.',
      },
    });
  }
}
