import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ActHelpers} from '../../mercury/ActHelpers';

export class SeizureOfIllegalFloaters extends ActCard {
  constructor() {
    super({
      name: CardName.SEIZURE_OF_ILLEGAL_FLOATERS,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.JOVIAN],
      metadata: {
        cardNumber: 'ACT34',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).minus().resource(CardResource.FLOATER, 3).asterix();
        }),
        description: 'Targeted player requires a floater. Victory: take up to 3 floaters from the defeated player.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.getResourceCount(CardResource.FLOATER) > 0;
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated !== undefined) {
      ActHelpers.stealCardResources(victor, defeated, CardResource.FLOATER, 3);
    }
  }
}
