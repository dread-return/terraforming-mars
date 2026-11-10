import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Tag} from '../../../common/cards/Tag';

export class ScienceMission extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SCIENCE_MISSION,
      tags: [Tag.SPACE],
      cost: 5,
      behavior: {
        drawCard: 3,
      },
      metadata: {
        cardNumber: 'E113',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may use titanium to pay for science cards.', (eb) => eb.tag(Tag.SCIENCE).startEffect.titanium(1)).br.cards(3).minus().cards(3);
        }),
        description: 'Draw 3 cards, then discard 3 cards.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => {
      const n = Math.min(3, player.cardsInHand.length);
      if (n === 0) {
        return undefined;
      }
      return new SelectCard('Discard 3 cards', 'Discard', player.cardsInHand, {min: n, max: n}).andThen((cards) => {
        for (const c of cards) {
          player.discardCardFromHand(c, {log: true});
        }
        return undefined;
      });
    });
    return undefined;
  }
}
