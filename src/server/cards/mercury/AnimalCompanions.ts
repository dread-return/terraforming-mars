import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';

export class AnimalCompanions extends ActCard {
  constructor() {
    super({
      name: CardName.ANIMAL_COMPANIONS,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.ANIMAL],
      bothBehavior: {addResourcesToAnyCard: {type: CardResource.ANIMAL, count: 2}, stock: {megacredits: {tag: Tag.ANIMAL}}},
      metadata: {
        cardNumber: 'ACT09',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ANIMAL, 2).asterix().megacredits(1).slash().tag(Tag.ANIMAL);
        }),
        description: 'Resolve (both): add 2 animals to any card. Gain 1 M€ for each animal tag you have.',
      },
    });
  }
}
