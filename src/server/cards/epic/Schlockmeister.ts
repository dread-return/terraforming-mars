import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';

export class Schlockmeister extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SCHLOCKMEISTER,
      startingMegaCredits: 40,
      resourceType: CardResource.DEFICIT,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'EP-SCH',
        description: 'You start with 40 M€. -1 VP per 3 deficits here.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you raise any non-M€ production, you may also raise M€ production 1 step and add 1 deficit here.', (eb) => {
              eb.production((pb) => pb.wild(1)).asterix().startEffect.production((pb) => pb.megacredits(1)).resource(CardResource.DEFICIT);
            });
          });
        }),
        victoryPoints: {points: -1, target: 3, item: {is: 'item', type: CardRenderItemType.RESOURCE, resource: CardResource.DEFICIT, amount: -1}},
      },
    });
  }

  public override getVictoryPoints(): number {
    return -Math.floor(this.resourceCount / 3);
  }
  // Effect is in EpicHooks.onProductionChange.
}
