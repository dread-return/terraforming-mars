import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class FloaterDistributors extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FLOATER_DISTRIBUTORS,
      tags: [Tag.VENUS, Tag.SPACE],
      cost: 5,
      behavior: {
        drawCard: {count: 1, tag: Tag.VENUS},
      },
      metadata: {
        cardNumber: 'E70',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.FLOATER, 3).asterix().cards(1, {secondaryTag: Tag.VENUS});
        }),
        description: 'Distribute 3 floaters among your cards. Reveal cards until you reveal a Venus card. Take it and discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 1, restrictedTag: undefined}));
    }
    return undefined;
  }
}
