import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';

export class MedicalFacilities extends ActCard {
  constructor() {
    super({
      name: CardName.MEDICAL_FACILITIES,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.BUILDING],
      bothBehavior: {stock: {megacredits: 6}, addResourcesToAnyCard: {type: CardResource.MICROBE, count: 2}},
      metadata: {
        cardNumber: 'ACT17',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(6).resource(CardResource.MICROBE, 2).asterix();
        }),
        description: 'Both players require a city. Resolve (both): gain 6 M€. Add 2 microbes to any card.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.game.board.getCities(initiator).length > 0 && other.game.board.getCities(other).length > 0;
  }
}
