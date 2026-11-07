import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class IonizedGasHarvest extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.IONIZED_GAS_HARVEST,
      tags: [Tag.RADIOACTIVE, Tag.JOVIAN, Tag.SPACE],
      cost: 22,
      requirements: {tag: Tag.SPACE, count: 2},
      resourceType: CardResource.RADIATION,
      // The VP badge shows a flat 1 VP; the card text says 1 VP per 3 radiation. Following the icon.
      victoryPoints: 1,
      behavior: {drawCard: 2},

      action: {
        or: {
          behaviors: [
            {title: 'Spend 1 titanium to add 2 radiation to ANY card', spend: {titanium: 1}, addResourcesToAnyCard: {type: CardResource.RADIATION, count: 2}},
            {title: 'Remove 1 radiation here to gain 1 energy and 1 steel', spend: {resourcesHere: 1}, stock: {energy: 1, steel: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N10',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 titanium to add 2 radiation to ANY card.', (eb) => {
            eb.titanium(1).startAction.resource(CardResource.RADIATION, 2).asterix();
          }).br;
          b.or().br;
          b.action('Remove 1 radiation here to gain 1 energy and 1 steel.', (eb) => {
            eb.resource(CardResource.RADIATION).startAction.energy(1).steel(1);
          }).br;
          b.cards(2);
        }),
        description: 'Requires 2 space tags. Draw 2 cards.',
      },
    });
  }
}
