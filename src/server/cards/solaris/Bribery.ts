import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

/** S38. */
export class Bribery extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BRIBERY,
      tags: [],
      cost: 1,
      requirements: {party: PartyName.BUREAUCRATS},

      behavior: {
        decreaseAnyProduction: {type: Resource.MEGACREDITS, count: 1},
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'S38',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(1, {all}).nbsp.plus().megacredits(1));
        }),
        description: 'Requires that Bureaucrats are ruling or that you have 2 delegates there. Decrease any M€ production 1 step and increase your own 1 step.',
      },
    });
  }
}
