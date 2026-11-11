import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

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
          b.megacredits(20).production((pb) => pb.steel(2).energy(2)).br;
          b.steel(3, {digit}).energy(3, {digit}).br;
          b.effect('Energy/steel prod. increases may go to either.', (eb) => eb.production((pb) => pb.energy(1)).startEffect.production((pb) => pb.steel(1)).asterix()).br;
          b.action('Pay 3 steel and 3 energy: +1 TR, draw a card.', (eb) => eb.steel(3, {digit}).energy(3, {digit}).startAction.tr(1).cards(1));
        }),
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
