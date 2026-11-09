import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

/** Planetary tags: Earth, Venus, Mars, Jovian, plus the fan Moon and Mercury tags. */
const PLANETARY_TAGS = [Tag.EARTH, Tag.VENUS, Tag.MARS, Tag.JOVIAN, Tag.MOON, Tag.MERCURY];

export class SurveyorsTeam extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SURVEYORS_TEAM,
      tags: [Tag.MARS, Tag.EARTH],
      cost: 10,

      metadata: {
        cardNumber: 'V76',
        renderData: CardRenderer.builder((b) => {
          b.action('Reveal the top card of the deck. Keep it if it has a planetary tag, otherwise discard it.', (eb) => {
            eb.empty().startAction.cards(1).asterix();
          });
        }),
      },
    });
  }

  public canAct() {
    return true;
  }

  public action(player: IPlayer) {
    const game = player.game;
    const card = game.projectDeck.draw(game);
    if (card === undefined) {
      return undefined;
    }
    game.log('${0} revealed ${1}', (b) => b.player(player).card(card));
    if (card.tags.some((tag) => PLANETARY_TAGS.includes(tag))) {
      player.cardsInHand.push(card);
      game.log('${0} kept ${1}', (b) => b.player(player).card(card), {reservedFor: player});
    } else {
      game.projectDeck.discard(card);
      game.log('${0} discarded ${1}', (b) => b.player(player).card(card));
    }
    return undefined;
  }
}
