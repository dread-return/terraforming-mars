import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

/** The effects are applied by Nuclear.onOxygenRaised. */
export class AerosolIsotopes extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.AEROSOL_ISOTOPES,
      tags: [Tag.RADIOACTIVE],
      cost: 12,
      requirements: {tag: Tag.RADIOACTIVE},

      metadata: {
        cardNumber: 'N26',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you raise oxygen, add a radiation to ANY card.', (eb) => {
            eb.oxygen(1).startEffect.resource(CardResource.RADIATION).asterix();
          }).br;
          b.effect('When an opponent raises oxygen, they lose 1 resource of their choice (not M€).', (eb) => {
            eb.oxygen(1, {all}).startEffect.text('-1 ?');
          });
        }),
        description: 'Requires 1 radioactive tag.',
      },
    });
  }
}
