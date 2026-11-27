import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class Toyitsu extends CorporationCard implements ICorporationCard {
  public static readonly COST = 5;

  constructor() {
    super({
      name: CardName.TOYITSU,
      tags: [Tag.BUILDING],
      startingMegaCredits: 30,

      metadata: {
        cardNumber: 'EP-TOY',
        description: 'You start with 30 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(30);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Whenever you raise a basic production, you may pay 5 M€ to raise it 1 step further.', (eb) => {
              eb.production((pb) => pb.wild(1)).startEffect.megacredits(5).colon().production((pb) => pb.wild(1)).asterix();
            });
          });
        }),
      },
    });
  }

  /** Set while Toyitsu's own extra step is being added, so it doesn't trigger itself. */
  private raising = false;

  public onProductionGain(player: IPlayer, resource: Resource, amount: number) {
    if (this.raising || amount <= 0) {
      return;
    }
    player.defer(() => {
      if (!player.canAfford(Toyitsu.COST)) {
        return undefined;
      }
      return new OrOptions(
        new SelectOption(`Pay ${Toyitsu.COST} M€ to raise your ${resource} production 1 more step`).andThen(() => {
          player.game.defer(new SelectPaymentDeferred(player, Toyitsu.COST, {title: 'Toyitsu: select how to pay'}).andThen(() => {
            this.raising = true;
            try {
              player.production.add(resource, 1, {log: true, from: {card: this}});
            } finally {
              this.raising = false;
            }
          }));
          return undefined;
        }),
        new SelectOption('Don\'t raise it').andThen(() => undefined),
      ).setTitle(`Toyitsu: raise your ${resource} production 1 more step?`);
    });
  }
}
