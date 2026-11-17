import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';
import {digit} from '../Options';

export class CropsSeizure extends ActCard {
  constructor() {
    super({
      name: CardName.CROPS_SEIZURE,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.PLANT],
      metadata: {
        cardNumber: 'ACT38',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).minus().plants(5, {digit}).asterix();
        }),
        description: 'Targeted player requires a greenery tile. Victory: steal up to 5 plants from the defeated player.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.game.board.getGreeneries(other).length > 0;
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated !== undefined && defeated.plants > 0) {
      defeated.stock.steal(Resource.PLANTS, 5, victor);
    }
  }
}
