import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';

export class PreferentialGovernmentContracts extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.PREFERENTIAL_GOVERNMENT_CONTRACTS,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH],
      cost: 8,
      requirements: {party: PartyName.MARS},
      metadata: {
        cardNumber: 'MM23',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you raise your TR, gain 2 M€ per step.', (eb) => {
            eb.tr(1).startEffect.megacredits(2);
          });
        }),
        description: 'Requires that Mars First are ruling or that you have 2 delegates there.',
      },
    });
  }

  public onIncreaseTerraformRatingByAnyPlayer(cardOwner: IPlayer, player: IPlayer, steps: number) {
    if (cardOwner === player && steps > 0) {
      cardOwner.stock.add(Resource.MEGACREDITS, 2 * steps, {log: true});
    }
  }
}
