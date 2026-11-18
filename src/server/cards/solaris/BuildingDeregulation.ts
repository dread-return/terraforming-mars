import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {IndustryStandardProject} from '../industries/IndustryStandardProject';

/** S15. Industry tiles are bought with the Industries standard projects. */
export class BuildingDeregulation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BUILDING_DEREGULATION,
      tags: [Tag.MARS],
      cost: 5,
      requirements: {party: PartyName.EMPOWER},

      metadata: {
        cardNumber: 'S15',
        renderData: CardRenderer.builder((b) => {
          b.effect('Industry tiles cost you 2 M€ less.', (eb) => {
            eb.text('industry').startEffect.megacredits(-2);
          });
        }),
        description: 'Requires that Empower are ruling or that you have 2 delegates there.',
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    return card instanceof IndustryStandardProject ? 2 : 0;
  }
}
