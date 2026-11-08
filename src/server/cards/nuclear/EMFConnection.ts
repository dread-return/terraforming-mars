import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';
import {NuclearPreludes} from './NuclearPreludes';

export class EMFConnection extends PreludeCard {
  constructor() {
    super({
      name: CardName.EMF_CONNECTION,
      tags: [Tag.JOVIAN],
      behavior: {
        global: {temperature: 1},
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'P01',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).nbsp.cards(1).br;
          b.cards(1, {secondaryTag: Tag.EVENT}).colon().megacredits(-11);
        }),
        description: 'Raise the temperature 1 step and draw a card. Play an event card from your hand, paying 11 M€ less.',
      },
    });
  }

  private static isEvent(card: IProjectCard): boolean {
    return card.type === CardType.EVENT;
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    return player.lastCardPlayed === this.name && EMFConnection.isEvent(card) ? 11 : 0;
  }

  public override bespokePlay(player: IPlayer) {
    NuclearPreludes.playDiscountedCard(player, this, EMFConnection.isEvent);
    return undefined;
  }
}
