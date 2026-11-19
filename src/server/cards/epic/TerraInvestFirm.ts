import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {WildResourceCorporation} from './WildResourceCorporation';

export class TerraInvestFirm extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.TERRA_INVEST_FIRM,
      tags: [Tag.WILD],
      startingMegaCredits: 40,
      resourceType: CardResource.WILD_RESOURCE,
      firstAction: {
        text: 'Raise your TR 2 steps',
        tr: 2,
      },
      action: {},

      metadata: {
        cardNumber: 'EP-TIF',
        description: 'You start with 40 M€. First action: raise your TR 2 steps.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).tr(2);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('TR raised: 1 wild resource per step.', (eb) => {
              eb.tr(1).startEffect.resource(CardResource.WILD_RESOURCE).text('=').wild(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend 1 wild: +1 M€ production.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.production((pb) => pb.megacredits(1));
            });
          });
        }),
      },
    });
  }

  public onIncreaseTerraformRatingByAnyPlayer(cardOwner: IPlayer, player: IPlayer, steps: number) {
    if (cardOwner === player) {
      this.addWild(cardOwner, steps);
    }
  }

  public override bespokeCanAct() {
    return this.resourceCount > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.removeResourceFrom(this, 1, {log: true});
    player.production.add(Resource.MEGACREDITS, 1, {log: true});
    return undefined;
  }
}
