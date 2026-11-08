import {digit} from '../Options';
import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

/** The steel value bonus is applied by Nuclear.steelValueBonus. */
export class RadiationShielding extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.RADIATION_SHIELDING,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 9,
      resourceType: CardResource.RADIATION,

      action: {
        spend: {resourcesHere: 1},
        stock: {steel: 1},
      },

      metadata: {
        cardNumber: 'N28',
        renderData: CardRenderer.builder((b) => {
          b.effect('If there are 5 or more radiation here, your steel is worth 1 M€ more.', (eb) => {
            eb.resource(CardResource.RADIATION, {amount: 5, digit}).colon().steel(1).startEffect.plus().megacredits(1);
          }).br;
          b.action('Remove a radiation here to gain 1 steel.', (eb) => {
            eb.resource(CardResource.RADIATION).startAction.steel(1);
          });
        }),
      },
    });
  }
}
