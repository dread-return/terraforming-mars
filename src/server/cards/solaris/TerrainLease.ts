import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';

export class TerrainLease extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TERRAIN_LEASE,
      tags: [Tag.BUILDING],
      cost: 15,
      requirements: {party: PartyName.REDS},
      victoryPoints: 1,

      metadata: {
        cardNumber: 'S33',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any player uses a standard project, gain 1 M€. Selling patents does not count.', (eb) => {
            eb.plate('Standard projects').asterix().startEffect.megacredits(1);
          });
        }),
        description: 'Requires that Reds are ruling or that you have 2 delegates there.',
      },
    });
  }

  public onStandardProjectByAnyPlayer(cardOwner: IPlayer, _activePlayer: IPlayer, project: IStandardProjectCard): void {
    if (project.name === CardName.SELL_PATENTS_STANDARD_PROJECT) {
      return;
    }
    cardOwner.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
  }
}
