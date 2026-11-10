import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class ResearchProfiteering extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.RESEARCH_PROFITEERING,
      tags: [Tag.MICROBE, Tag.ANIMAL, Tag.SCIENCE],
      cost: 1,
      requirements: {tag: Tag.ANIMAL},
      victoryPoints: -1,
      behavior: {
        removeResourcesFromAnyCard: {type: CardResource.ANIMAL, count: 1, source: 'all'},
        drawCard: {count: 1, tag: Tag.ANIMAL},
        stock: {megacredits: {tag: Tag.MICROBE, each: 2}},
      },
      metadata: {
        cardNumber: 'E110',
        renderData: CardRenderer.builder((b) => {
          b.minus().resource(CardResource.ANIMAL, {all}).cards(1, {secondaryTag: Tag.ANIMAL}).br.megacredits(2).slash().tag(Tag.MICROBE);
        }),
        description: 'Requires 1 animal tag. Remove 1 animal from anywhere. Reveal cards until you reveal an animal card; take it and discard the rest. Gain 2 M\u20ac for every microbe tag you have.',
      },
    });
  }
}
