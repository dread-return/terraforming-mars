import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

/** Paying for radioactive cards with steel is handled by Nuclear.canUseSteel. */
export class FreeRadicals extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FREE_RADICALS,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 17,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},
      behavior: {drawCard: 1},

      action: {
        spend: {resourcesHere: 1},
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'N78',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may use steel to pay for radioactive cards.', (eb) => {
            eb.tag(Tag.RADIOACTIVE).startEffect.steel(1);
          }).br;
          b.action('Remove a radiation here to draw a card.', (eb) => {
            eb.resource(CardResource.RADIATION).startAction.cards(1);
          }).br;
          b.cards(1);
        }),
        description: 'Draw a card. 1 VP for every 4 radiation on this card.',
      },
    });
  }
}
