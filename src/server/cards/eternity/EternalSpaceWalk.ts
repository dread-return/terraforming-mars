import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class EternalSpaceWalk extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ETERNAL_SPACE_WALK,
      tags: [Tag.SPACE],
      cost: 0,
      behavior: {
        drawCard: 1,
        stock: {megacredits: 5},
        tr: -1,
      },
      metadata: {
        cardNumber: 'E11',
        renderData: CardRenderer.builder((b) => {
          b.effect('Your space-tag cards cost 2 M€ more. Buying cards costs you 1 M€ less.', (eb) => {
            eb.tag(Tag.SPACE).colon().megacredits(2).nbsp.cards(1).startEffect.megacredits(-1);
          }).br;
          b.cards(1).megacredits(5).minus().tr(1).br;
          b.text('Must be the only project card you play this generation.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Must be the only project card you play this generation. Draw 1 card, gain 5 M\u20ac, and lose 1 TR.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.projectCardsThisGeneration.length === 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.cardCost = Math.max(0, player.cardCost - 1);
    return undefined;
  }
  public override onDiscard(player: IPlayer) {
    super.onDiscard(player);
    player.cardCost += 1;
  }
}
