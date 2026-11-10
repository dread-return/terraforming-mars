import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class Powerhouse extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.POWERHOUSE,
      tags: [Tag.POWER, Tag.BUILDING],
      startingMegaCredits: 20,
      behavior: {
        stock: {steel: 3, energy: 3},
        production: {steel: 2, energy: 2},
      },
      metadata: {
        cardNumber: 'EC18',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(20).steel(3).energy(3).production((pb) => pb.steel(2).energy(2)).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('When you increase energy or steel production, choose which one (no splitting).', (eb) => eb.production((pb) => pb.energy(1)).startEffect.production((pb) => pb.steel(1)).asterix());
            ce.action('Pay 3 steel and 3 energy to raise your TR 1 step and draw a card.', (eb) => eb.steel(3).energy(3).startAction.tr(1).cards(1));
          });
        }),
        description: 'You start with 20 M\u20ac, 3 steel, 3 energy, 2 steel production and 2 energy production.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.steel >= 3 && player.energy >= 3 && player.canAfford({cost: 0, tr: {tr: 1}});
  }
  public action(player: IPlayer) {
    player.stock.deduct(Resource.STEEL, 3);
    player.stock.deduct(Resource.ENERGY, 3);
    player.increaseTerraformRating(1);
    player.drawCard();
    return undefined;
  }
}
