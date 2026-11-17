import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ActHelpers} from '../../mercury/ActHelpers';

export class CraterReservationTax extends ActCard {
  constructor() {
    super({
      name: CardName.CRATER_RESERVATION_TAX,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.MERCURY],
      victoryBehavior: {stock: {megacredits: 8}},
      metadata: {
        cardNumber: 'ACT37',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).megacredits(8).br.text('defeat:', {size: Size.SMALL}).minus().megacredits(2).slash().tag(Tag.MERCURY);
        }),
        description: 'Targeted player requires a Mercury tag. Victory: gain 8 M€. Defeat: pay 2 M€ for every Mercury tag you have.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.tags.count(Tag.MERCURY, 'raw') > 0;
  }

  public override defeat(defeated: IPlayer) {
    ActHelpers.payUpTo(defeated, 2 * defeated.tags.count(Tag.MERCURY, 'raw'));
  }
}
