import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ActHelpers} from '../../mercury/ActHelpers';

export class CommunicationContracts extends ActCard {
  constructor() {
    super({
      name: CardName.COMMUNICATION_CONTRACTS,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.MARS],
      victoryBehavior: {addResourcesToAnyCard: {type: CardResource.DATA, count: 2}, drawCard: 2},
      metadata: {
        cardNumber: 'ACT35',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).resource(CardResource.DATA, 2).asterix().cards(2).br;
          b.minus().resource(CardResource.DATA, 3).asterix();
        }),
        description: 'Victory: add 2 data to any card. Draw 2 cards. Remove up to 3 data from any card of the defeated player.',
      },
    });
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    super.victory(victor, defeated);
    if (defeated !== undefined) {
      ActHelpers.removeCardResources(victor, defeated, CardResource.DATA, 3);
    }
  }
}
