import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';
import {ChooseCards} from '../../deferredActions/ChooseCards';

export class ProfiCoin extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PROFICOIN,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 40,
      initialActionText: 'Deal every player 2 cards; each may buy them',

      metadata: {
        cardNumber: 'EP-PFC',
        description: 'You start with 40 M€. First action: deal EVERY player 2 cards; each may buy them.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).cards(2, {all}).asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect(undefined, (eb) => {
              eb.cards(1, {all}).asterix().startEffect.megacredits(1);
            });
            ce.effect('Any card bought: +1 M€ (outside research), or +1 M€ per 2 at the end of research.', (eb) => {
              eb.text('research', {size: Size.SMALL}).startEffect.megacredits(1).slash().text('2').cards(1, {all});
            });
          });
        }),
      },
    });
  }

  public data: {researchBought?: number} = {};

  public override initialAction(player: IPlayer) {
    const game = player.game;
    for (const p of game.players) {
      const cards = game.projectDeck.drawN(game, 2);
      p.defer(new ChooseCards(p, cards, {paying: true, keepMax: 2}).execute());
    }
    return undefined;
  }
  // Payments are in EpicHooks (onCardsKept, onResearchPhaseEnd).
}
