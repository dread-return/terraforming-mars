import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class SpaceMadness extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SPACE_MADNESS,
      tags: [Tag.EARTH, Tag.SPACE],
      cost: 0,
      victoryPoints: -1,
      metadata: {
        cardNumber: 'E120',
        renderData: CardRenderer.builder((b) => {
          b.text('All other players with a space tag, twice: discard a card OR lose 3 M€.', {size: Size.SMALL});
        }),
        description: 'All OTHER players who have a space tag must, twice, either discard a card or lose 3 M\u20ac.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.opponents) {
      if (p.tags.count(Tag.SPACE, 'raw') === 0) {
        continue;
      }
      for (let i = 0; i < 2; i++) {
        p.defer(() => {
          const discard = new SelectOption('Discard a card').andThen(() => new SelectCard('Discard a card', 'Discard', p.cardsInHand).andThen(([c]) => {
            p.discardCardFromHand(c, {log: true});
            return undefined;
          }));
          const lose = new SelectOption('Lose 3 M€').andThen(() => {
            p.stock.deduct(Resource.MEGACREDITS, Math.min(3, p.megaCredits), {log: true, from: {player}});
            return undefined;
          });
          if (p.cardsInHand.length === 0) {
            lose.cb(undefined);
            return undefined;
          }
          return new OrOptions(discard, lose).setTitle('Space Madness: discard a card or lose 3 M€');
        });
      }
    }
    return undefined;
  }
}
