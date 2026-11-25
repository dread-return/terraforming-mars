import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {digit} from '../Options';

export class ColdFusion extends CorporationCard {
  constructor() {
    super({
      name: CardName.COLD_FUSION,
      tags: [Tag.POWER, Tag.POWER],
      startingMegaCredits: 20,

      behavior: {
        production: {energy: 10},
      },

      metadata: {
        cardNumber: 'EP-CFS',
        description: 'You start with 20 M€, 10 energy production, TR 18.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(20).production((pb) => pb.energy(10, {digit})).nbsp.tr(1, {text: '-2'}).br;
          b.effect('Cards that lower your energy production cost 4 M€ less per step.', (eb) => {
            eb.minus().production((pb) => pb.energy(1)).startEffect.megacredits(-4);
          }).br;
          b.effect('Sell energy for 1 M€ each, any time.', (eb) => {
            eb.energy(1, {text: 'x'}).startEffect.megacredits(0, {text: 'x'});
          }).br;
          b.effect('In production, keep up to half your energy.', (eb) => {
            eb.text('1/2', {size: Size.SMALL}).energy(1).startEffect.energy(1).asterix();
          }).br;
          b.effect('Your energy production doesn\'t count for milestones or awards.', (eb) => {
            eb.production((pb) => pb.energy(1)).startEffect.text('no', {size: Size.SMALL}).milestone().award();
          });
        }),
      },
    });
  }

  public static readonly DISCOUNT = 4;

  public override bespokePlay(player: IPlayer) {
    player.decreaseTerraformRating(2, {log: true});
    return undefined;
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    const energy = card.behavior?.production;
    if (energy === undefined || typeof energy === 'function') {
      return 0;
    }
    const steps = (energy as {energy?: unknown}).energy;
    return typeof steps === 'number' && steps < 0 ? -steps * ColdFusion.DISCOUNT : 0;
  }
}
