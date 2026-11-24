import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class Xanthum extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.XANTHUM,
      tags: [Tag.BUILDING, Tag.SPACE],
      startingMegaCredits: 41,
      resourceType: CardResource.ALLOY,

      behavior: {
        production: {steel: 1, titanium: 1},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-XAN',
        description: 'You start with 41 M€, 1 steel production and 1 titanium production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).production((pb) => pb.steel(1).titanium(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Spend X steel and X titanium to add X alloy here.', (eb) => {
              eb.text('X').steel(1).titanium(1).startAction.text('X').resource(CardResource.ALLOY);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Alloy pays 5 M€ each for space and building cards. *Effects raising steel or titanium value raise it too.', (eb) => {
              eb.tag(Tag.BUILDING).tag(Tag.SPACE).startEffect.resource(CardResource.ALLOY).equals().megacredits(5).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.steel > 0 && player.titanium > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const max = Math.min(player.steel, player.titanium);
    const make = (x: number) => {
      player.stock.deduct(Resource.STEEL, x, {log: true});
      player.stock.deduct(Resource.TITANIUM, x, {log: true});
      player.addResourceTo(this, {qty: x, log: true});
      return undefined;
    };
    if (max === 1) {
      return make(1);
    }
    return new SelectAmount('Turn how many steel and titanium pairs into alloy?', 'Make alloy', 1, max, true).andThen(make);
  }
}
