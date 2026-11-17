import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';

export class MicrobialResearch extends ActCard {
  constructor() {
    super({
      name: CardName.MICROBIAL_RESEARCH,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      bothBehavior: {drawCard: {count: 1, tag: Tag.MICROBE}, addResourcesToAnyCard: {type: CardResource.MICROBE, count: 4}},
      metadata: {
        cardNumber: 'ACT16',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.MICROBE}).resource(CardResource.MICROBE, 4).asterix();
        }),
        description: 'One of the players requires a microbe tag. Resolve (both): draw a card with a microbe tag. Add 4 microbes to any card.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.tags.count(Tag.MICROBE, 'raw') > 0 || other.tags.count(Tag.MICROBE, 'raw') > 0;
  }
}
