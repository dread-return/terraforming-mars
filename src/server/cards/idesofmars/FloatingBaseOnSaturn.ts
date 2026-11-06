import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {ICard} from '../ICard';

export class FloatingBaseOnSaturn extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FLOATING_BASE_ON_SATURN,
      tags: [Tag.JOVIAN],
      cost: 20,
      victoryPoints: 4,

      metadata: {
        cardNumber: 'I08',
        renderData: CardRenderer.builder((b) => {
          b.minus().resource(CardResource.FLOATER, {amount: 2, secondaryTag: Tag.JOVIAN});
        }),
        description: 'Remove 2 floaters from a Jovian card you own.',
      },
    });
  }

  private sources(player: IPlayer): Array<ICard> {
    return player.getResourceCards(CardResource.FLOATER)
      .filter((card) => card.tags.includes(Tag.JOVIAN) && card.resourceCount >= 2);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.sources(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return new SelectCard('Select a Jovian card to remove 2 floaters from', 'Remove floaters', this.sources(player))
      .andThen(([card]) => {
        player.removeResourceFrom(card, 2, {log: true});
        return undefined;
      });
  }
}
