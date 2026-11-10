import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class SecondRockSubsidies extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SECOND_ROCK_SUBSIDIES,
      tags: [Tag.VENUS],
      cost: 14,
      requirements: {tag: Tag.SCIENCE, count: 2},
      victoryPoints: 1,
      behavior: {
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'E115',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Venus tag, including this, you may pay 1 M€ to draw a card.', (eb) => eb.tag(Tag.VENUS).megacredits(1).startEffect.cards(1)).br.venus(1);
        }),
        description: 'Requires 2 science tags. Raise Venus 1 step.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.VENUS).length;
    for (let i = 0; i < n; i++) {
      player.defer(() => {
        if (!player.canAfford(1)) {
          return undefined;
        }
        return new OrOptions(
          new SelectOption('Pay 1 M€ to draw a card').andThen(() => {
            player.stock.deduct(Resource.MEGACREDITS, 1);
            player.drawCard();
            return undefined;
          }),
          new SelectOption('Do not draw'));
      });
    }
    return undefined;
  }
}
