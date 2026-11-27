import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';

export class PolitiCorp extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.POLITICORP,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,

      behavior: {
        turmoil: {influenceBonus: 1},
      },

      action: {
        spend: {megacredits: 2},
        turmoil: {sendDelegates: {count: 1}},
      },

      metadata: {
        cardNumber: 'EP-POL',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('You have +1 influence. While you are chairman, your cards cost 1 M€ less.', (eb) => {
              eb.influence().slash().chairman().startEffect.megacredits(-1);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend 2 M€ to place 1 delegate.', (eb) => {
              eb.megacredits(2).startAction.delegates(1);
            });
          });
        }),
      },
    });
  }

  public override getCardDiscount(player: IPlayer, _card: IProjectCard) {
    return player.game.turmoil?.chairman === player ? 1 : 0;
  }
}
