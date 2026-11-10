import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class CryptoPonziScheme extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CRYPTO_PONZI_SCHEME,
      tags: [Tag.MARS, Tag.EARTH],
      cost: 20,
      victoryPoints: 1,
      behavior: {
        drawCard: 4,
      },
      metadata: {
        cardNumber: 'E60',
        renderData: CardRenderer.builder((b) => {
          b.cards(4).br.text('This generation:').megacredits(-3).asterix();
        }),
        description: 'Draw 4 cards. Every card you play this generation costs 3 M\u20ac less.',
      },
    });
  }

  public generationUsed?: number;
  public override getCardDiscount(player: IPlayer, card: IProjectCard): number {
    return (player.game.generation === this.generationUsed && card !== this) ? 3 : 0;
  }
  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    return undefined;
  }
}
