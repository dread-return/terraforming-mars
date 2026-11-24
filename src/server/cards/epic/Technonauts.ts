import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {CardResource} from '../../../common/CardResource';

export class Technonauts extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.TECHNONAUTS,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 45,
      resourceType: CardResource.ROBOT,

      behavior: {
        addResources: 3,
      },

      action: {
      },

      metadata: {
        cardNumber: 'EP-TCN',
        description: 'You start with 45 M€ and 3 robots.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).resource(CardResource.ROBOT, 3);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend 1 energy and 1 titanium: add a robot here.', (eb) => {
              eb.energy(1).titanium(1).startAction.resource(CardResource.ROBOT);
            });
            ce.effect('Robots here pay 6 M€ each for active cards and for card actions.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.BLUE}).startEffect.resource(CardResource.ROBOT).equals().megacredits(6);
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.titanium > 0 && player.energy > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.deduct(Resource.TITANIUM, 1, {log: true});
    player.stock.deduct(Resource.ENERGY, 1, {log: true});
    player.addResourceTo(this, {qty: 1, log: true});
    return undefined;
  }
}
