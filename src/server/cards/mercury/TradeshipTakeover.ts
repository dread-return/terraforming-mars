import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class TradeshipTakeover extends ActCard {
  constructor() {
    super({
      name: CardName.TRADESHIP_TAKEOVER,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      metadata: {
        cardNumber: 'ACT41',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).tradeFleet().asterix();
        }),
        description: 'Victory: until the end of the upcoming generation, take control of 1 trade fleet of the defeated player. You can use it as yours.',
      },
    });
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated !== undefined) {
      Mercury.lendTradeFleet(defeated, victor);
    }
  }
}
