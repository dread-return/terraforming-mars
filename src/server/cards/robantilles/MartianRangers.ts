import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {SelectCard} from '../../inputs/SelectCard';

export class MartianRangers extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_RANGERS,
      tags: [Tag.ANIMAL, Tag.EARTH],
      cost: 12,

      metadata: {
        cardNumber: 'H35',
        renderData: CardRenderer.builder((b) => {
          b.effect('Opponents cannot remove your animals.', (eb) => {
            eb.resource(CardResource.ANIMAL).startEffect.text('protected');
          }).br;
          b.resource(CardResource.ANIMAL, 2).asterix();
        }),
        description: 'Add 2 animals to a card that already has at least 1 animal.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const cards = player.getCardsWithResources(CardResource.ANIMAL);
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectCard('Select card to add 2 animals', 'Add animals', cards)
      .andThen(([card]) => {
        player.addResourceTo(card, {qty: 2, log: true});
        return undefined;
      });
  }
}
