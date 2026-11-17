import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class BotanicalInitiative extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.BOTANICAL_INITIATIVE,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT, Tag.SCIENCE],
      cost: 20,
      requirements: {party: PartyName.SCIENTISTS},
      behavior: {
        production: {plants: 2},
        stock: {plants: 2},
        addResourcesToAnyCard: {type: CardResource.DATA, count: 2},
      },
      metadata: {
        cardNumber: 'MM24',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).plants(2).resource(CardResource.DATA, 2).asterix();
        }),
        description: 'Requires that Scientists are ruling or that you have 2 delegates there. Increase your plant production 2 steps. Gain 2 plants. Add 2 data to any card.',
      },
    });
  }
}
