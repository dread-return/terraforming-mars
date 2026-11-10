import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class ProjectWhammy extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PROJECT_WHAMMY,
      tags: [Tag.SPACE, Tag.SCIENCE, Tag.JOVIAN],
      cost: 150,
      victoryPoints: {tag: Tag.JOVIAN},
      behavior: {
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E107',
        renderData: CardRenderer.builder((b) => {
          b.effect('All your science tags count as Jovian tags as well.', (eb) => eb.tag(Tag.SCIENCE).startEffect.tag(Tag.JOVIAN)).br.cards(1);
        }),
        description: 'Draw a card. 1 VP per Jovian tag you have.',
      },
    });
  }
}
