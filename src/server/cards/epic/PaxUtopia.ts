import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {digit} from '../Options';
import * as VP from '../render/DynamicVictoryPoints';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';

export class PaxUtopia extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PAX_UTOPIA,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 60,
      victoryPoints: 'special',
      action: {},

      behavior: {
        tr: 5,
      },

      metadata: {
        cardNumber: 'EP-PAX',
        description: 'You start with 60 M€ and 5 extra TR. *-1 VP per card of yours with positive VP; +1 VP per negative-VP card opponents played.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(60).tr(5, {digit});
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Lower your TR 1 step to draw 3 cards.', (eb) => {
              eb.minus().tr(1).startAction.cards(3);
            });
          });
        }),
        victoryPoints: VP.both(
          {points: -1, target: 1, item: {is: 'item', type: CardRenderItemType.VP, innerText: '+', amount: 1}},
          {points: 1, target: 1, item: {is: 'item', type: CardRenderItemType.VP, innerText: '-', amount: 1, anyPlayer: true}, asterisk: true}),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.terraformRating > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.decreaseTerraformRating(1, {log: true});
    player.drawCard(3);
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    let points = 0;
    for (const card of player.tableau) {
      if (card !== this && card.getVictoryPoints(player) > 0) {
        points--;
      }
    }
    for (const opponent of player.opponents) {
      for (const card of opponent.tableau) {
        if (card.getVictoryPoints(opponent) < 0) {
          points++;
        }
      }
    }
    return points;
  }
}
