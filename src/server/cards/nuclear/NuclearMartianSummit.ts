import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class NuclearMartianSummit extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.NUCLEAR_MARTIAN_SUMMIT,
      tags: [Tag.MARS],
      cost: 1,

      metadata: {
        cardNumber: 'N62',
        renderData: CardRenderer.builder((b) => {
          b.text('this generation:', {size: Size.SMALL}).br;
          b.cards(1).colon().megacredits(-1).nbsp.cards(1, {secondaryTag: Tag.EVENT}).colon().megacredits(-2);
        }),
        description: 'This generation, cards you play cost 1 M€ less and event cards you play cost 2 M€ less.',
      },
    });
  }

  public generationUsed: number | undefined = undefined;

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    return undefined;
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    if (this.generationUsed !== player.game.generation) {
      return 0;
    }
    return card.type === CardType.EVENT ? 2 : 1;
  }
}
