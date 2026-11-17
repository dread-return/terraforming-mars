import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';
import {questionmark} from '../render/DynamicVictoryPoints';

export class AresSecurity extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ARES_SECURITY,
      startingMegaCredits: 39,
      victoryPoints: 'special',

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'EP-ASE',
        description: 'You start with 39 M€ and 1 M€ production. Your cards with negative VP score 0 VP.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(39).production((pb) => pb.megacredits(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When a player removes another player\'s resources or production, gain 1 of that resource or production.', (eb) => {
              eb.minus().wild(1, {all}).asterix().startEffect.wild(1);
            });
          });
        }),
        victoryPoints: questionmark(),
      },
    });
  }

  // The steal effect is in EpicHooks.onReducedByAnotherPlayer.
  public override getVictoryPoints(player: IPlayer): number {
    // Cancel out every negative card VP.
    let points = 0;
    for (const card of player.tableau) {
      if (card === this) {
        continue;
      }
      const vp = card.getVictoryPoints(player);
      if (vp < 0) {
        points -= vp;
      }
    }
    return points;
  }
}
