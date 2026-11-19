import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {all} from '../Options';
import {SelectCard} from '../../inputs/SelectCard';
import {isIActionCard} from '../ICard';
import {IActionCard} from '../ICard';

export class OmegaCorporation extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OMEGA_CORPORATION,
      startingMegaCredits: 48,
      action: {},

      metadata: {
        cardNumber: 'EP-OMG',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(48);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Use the action of another player\'s blue card (even if they used it this generation).', (eb) => {
              eb.empty().startAction.cards(1, {secondaryTag: AltSecondaryTag.BLUE, all}).asterix();
            });
          });
        }),
      },
    });
  }

  private cards(player: IPlayer): Array<IActionCard & ICard> {
    const result: Array<IActionCard & ICard> = [];
    for (const opponent of player.opponents) {
      for (const card of opponent.tableau) {
        if (card.type === CardType.ACTIVE && isIActionCard(card) && card.canAct(player)) {
          result.push(card);
        }
      }
    }
    return result;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.cards(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Omega Corporation: use another player\'s action', 'Use', this.cards(player)).andThen(([card]) => {
      player.game.log('${0} used the action of ${1} with ${2}', (b) => b.player(player).card(card).card(this));
      return card.action(player);
    });
  }
}
