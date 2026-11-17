import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class TechnologyFairs extends ActCard {
  constructor() {
    super({
      name: CardName.TECHNOLOGY_FAIRS,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.MERCURY],
      bothBehavior: {drawCard: 4},
      metadata: {
        cardNumber: 'ACT08',
        renderData: CardRenderer.builder((b) => {
          b.cards(4).actCard(2);
        }),
        description: 'Resolve (both): draw 4 project cards. Draw 2 Act cards.',
      },
    });
  }

  public override resolveFor(player: IPlayer, other: IPlayer | undefined) {
    super.resolveFor(player, other);
    Mercury.drawActs(player, 2);
  }
}
