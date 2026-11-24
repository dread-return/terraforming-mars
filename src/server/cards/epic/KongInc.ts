import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {digit} from '../Options';

export class KongInc extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.KONG_INC,
      tags: [Tag.PLANT],
      startingMegaCredits: 64,

      behavior: {
        production: {megacredits: 9, plants: 1},
        stock: {plants: 2},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-KNG',
        description: 'You start with 64 M€, 9 M€ production, 1 plant production and 2 plants.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(64).production((pb) => pb.megacredits(9).plants(1)).plants(2, {digit});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Each action, except on blue cards, costs 1 plant.', (eb) => {
              eb.text('action', {size: Size.SMALL}).cards(1, {secondaryTag: AltSecondaryTag.BLUE, cancelled: true}).startEffect.minus().plants(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('With no plants: gain 2 plants (this action costs 1).', (eb) => {
              eb.text('0').plants(1).startAction.plants(2, {digit});
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.plants === 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.add(Resource.PLANTS, 2, {log: true});
    return undefined;
  }
}
