import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class MarsRoverExploringMission extends PreludeCard {
  constructor() {
    super({
      name: CardName.MARS_ROVER_EXPLORING_MISSION,
      tags: [Tag.MARS, Tag.BUILDING],
      behavior: {
        stock: {steel: 2},
      },
      metadata: {
        cardNumber: 'EP33',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.MARS}).cards(1).asterix().br.text('play:').megacredits(-10).asterix().steel(2);
        }),
        description: 'Reveal cards until you reveal a Mars card and a card that holds data; take them and shuffle the rest back. Play a Mars card, reducing its cost by 10 M\u20ac. Gain 2 steel.',
      },
    });
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard): number {
    return (player.lastCardPlayed === this.name && card.tags.includes(Tag.MARS)) ? 10 : 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.drawCard(1, {tag: Tag.MARS});
    player.drawCard(1, {resource: CardResource.DATA});
    EternityUtils.mayPlayFromHand(player, (c) => c.tags.includes(Tag.MARS));
    return undefined;
  }
}
