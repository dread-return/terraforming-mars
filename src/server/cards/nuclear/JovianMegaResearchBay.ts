import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class JovianMegaResearchBay extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.JOVIAN_MEGA_RESEARCH_BAY,
      tags: [Tag.RADIOACTIVE, Tag.JOVIAN, Tag.SPACE],
      cost: 31,
      victoryPoints: {tag: Tag.JOVIAN},
      behavior: {tr: 1},

      action: {
        spend: {titanium: 1},
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'N72',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a radioactive tag, including this, draw a card.', (eb) => {
            eb.tag(Tag.RADIOACTIVE).startEffect.cards(1);
          }).br;
          b.action('Spend 1 titanium to draw a card.', (eb) => {
            eb.titanium(1).startAction.cards(1);
          }).br;
          b.tr(1);
        }),
        description: 'Raise your TR 1 step. 1 VP for every Jovian tag you own, including this.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.tags.includes(Tag.RADIOACTIVE)) {
      player.drawCard();
    }
  }
}
