import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {PartyName} from '../../../common/turmoil/PartyName';

export class Clonation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CLONATION,
      tags: [Tag.SCIENCE, Tag.ANIMAL],
      cost: 10,
      requirements: {party: PartyName.SCIENTISTS},

      metadata: {
        cardNumber: 'H40',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ANIMAL).colon().text('each card with an animal');
        }),
        description: 'Requires that Scientists are ruling or that you have 2 delegates there. ' +
          'Add an animal to every card of yours that has at least one animal.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const card of player.getCardsWithResources(CardResource.ANIMAL)) {
      player.addResourceTo(card, {qty: 1, log: true});
    }
    return undefined;
  }
}
