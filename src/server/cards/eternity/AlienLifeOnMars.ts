import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class AlienLifeOnMars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ALIEN_LIFE_ON_MARS,
      tags: [Tag.EARTH, Tag.MARS],
      cost: 24,
      victoryPoints: 3,
      metadata: {
        cardNumber: 'E03',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.EARTH}).cards(1, {secondaryTag: Tag.MARS});
        }),
        description: 'Reveal cards until you reveal one with an Earth tag and one with a Mars tag. Take those 2 cards into your hand and discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.drawCard(1, {tag: Tag.EARTH});
    player.drawCard(1, {tag: Tag.MARS});
    return undefined;
  }
}
