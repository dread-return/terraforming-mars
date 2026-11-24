import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {CardResource} from '../../../common/CardResource';

export class StellarRobotics extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.STELLAR_ROBOTICS,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 43,
      resourceType: CardResource.ROBOT,

      behavior: {
        production: {steel: 1},
        addResources: 1,
      },

      action: {
      },

      metadata: {
        cardNumber: 'EP-STR',
        description: 'You start with 43 M€, 1 steel production and 1 robot.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43).production((pb) => pb.steel(1)).resource(CardResource.ROBOT);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('1 steel and 1 energy: add a robot here.', (eb) => {
              eb.steel(1).energy(1).startAction.resource(CardResource.ROBOT);
            });
            ce.effect('Robots pay 5 M€ each for green cards.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.GREEN}).startEffect.resource(CardResource.ROBOT).equals().megacredits(5);
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.steel > 0 && player.energy > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.deduct(Resource.STEEL, 1, {log: true});
    player.stock.deduct(Resource.ENERGY, 1, {log: true});
    player.addResourceTo(this, {qty: 1, log: true});
    return undefined;
  }
}
