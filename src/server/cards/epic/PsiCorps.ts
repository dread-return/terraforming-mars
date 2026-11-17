import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';

export class PsiCorps extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PSI_CORPS,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 38,
      initialActionText: 'Draw a Prelude card and play it',

      action: {
        spend: {megacredits: 2},
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'EP-PSI',
        description: 'You start with 38 M€. As your first action, draw a Prelude card and play it.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).prelude().asterix().br;
          b.action('Spend 2 M€ to draw a card.', (eb) => {
            eb.megacredits(2).startAction.cards(1);
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const cards = game.preludeDeck.drawN(game, 1);
    if (cards.length === 0) {
      return undefined;
    }
    return PreludesExpansion.selectPreludeToPlay(player, cards);
  }
}
