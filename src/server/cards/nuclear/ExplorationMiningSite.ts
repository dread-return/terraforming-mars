import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {max} from '../Options';

export class ExplorationMiningSite extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.EXPLORATION_MINING_SITE,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 21,
      requirements: {temperature: -14, max},
      victoryPoints: 1,
      behavior: {
        production: {steel: 2},
        drawCard: 2,
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
      },

      metadata: {
        cardNumber: 'N75',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(2)).nbsp.cards(2).br;
          b.resource(CardResource.RADIATION).asterix();
        }),
        description: 'Requires -14 °C or colder. Increase your steel production 2 steps, draw 2 cards and add a radiation to ANY card.',
      },
    });
  }
}
