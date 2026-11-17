import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class ExternalRevenueService extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EXTERNAL_REVENUE_SERVICE,
      tags: [Tag.EARTH],
      startingMegaCredits: 42,
      behavior: {
        production: {megacredits: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-ERS',
        description: 'You start with 42 M€ and 1 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).production((pb) => pb.megacredits(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Every other player loses 1 M€ for every 20 M€ they have. Gain the total amount lost.', (eb) => {
              eb.empty().startAction.minus().megacredits(1, {all}).slash().megacredits(20, {all, digit}).nbsp.plus().megacredits(1, {text: 'x'});
            });
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    let total = 0;
    for (const opponent of player.opponents) {
      const loss = Math.floor(opponent.megaCredits / 20);
      if (loss > 0) {
        opponent.stock.deduct(Resource.MEGACREDITS, loss, {log: true, from: {player}});
        total += loss;
      }
    }
    if (total > 0) {
      player.stock.add(Resource.MEGACREDITS, total, {log: true});
    }
    return undefined;
  }
}
