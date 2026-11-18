import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

/** S39. */
export class MarsAcademyOfPoliticalSciences extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARS_ACADEMY_OF_POLITICAL_SCIENCES,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 13,
      requirements: {party: PartyName.CENTRISTS},

      metadata: {
        cardNumber: 'S39',
        renderData: CardRenderer.builder((b) => {
          b.effect('You have +2 influence.', (eb) => {
            eb.startEffect.influence({amount: 2});
          });
        }),
        description: 'Requires that Centrists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public getInfluenceBonus() {
    return 2;
  }
}
