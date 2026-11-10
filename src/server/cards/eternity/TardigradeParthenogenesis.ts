import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {EternityUtils} from './EternityUtils';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class TardigradeParthenogenesis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.TARDIGRADE_PARTHENOGENESIS,
      tags: [Tag.MICROBE, Tag.ANIMAL],
      cost: 12,
      requirements: {tag: Tag.MICROBE, count: 2},
      behavior: {
        addResourcesToAnyCard: [{type: CardResource.ANIMAL, count: 1}, {type: CardResource.MICROBE, count: 2}],
      },
      metadata: {
        cardNumber: 'E33',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).asterix().br;
          b.resource(CardResource.ANIMAL).asterix().resource(CardResource.MICROBE, 2).asterix();
        }),
        description: 'Requires 2 microbe tags. Reveal cards until you reveal one that holds animals; take it and discard the rest. You may play it this generation ignoring global requirements. Add 1 animal to a card and 2 microbes to a card.',
      },
    });
  }

  public data: {card?: string, gen?: number} = {};
  public override bespokePlay(player: IPlayer) {
    EternityUtils.drawThen(player, 1, {resource: CardResource.ANIMAL}, (cards) => {
      if (cards[0] !== undefined) {
        this.data = {card: cards[0].name, gen: player.game.generation};
      }
    });
    return undefined;
  }
  public ignoresGlobalRequirementsFor(player: IPlayer, card: ICard): boolean {
    return card.name === this.data.card && player.game.generation === this.data.gen;
  }
}
