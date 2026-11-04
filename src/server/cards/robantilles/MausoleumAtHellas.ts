import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';

export class MausoleumAtHellas extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MAUSOLEUM_AT_HELLAS,
      tags: [Tag.MARS],
      cost: 16,
      resourceType: CardResource.RELIC,
      victoryPoints: {resourcesHere: {}},

      action: {
        spend: {cards: 1},
        addResources: 1,
      },

      metadata: {
        cardNumber: 'H28',
        renderData: CardRenderer.builder((b) => {
          b.action('Discard a card from your hand to add a relic to this card.', (eb) => {
            eb.minus().cards(1).startAction.resource(CardResource.RELIC);
          }).br;
          b.vpText('1 VP per relic on this card.');
        }),
      },
    });
  }
}
