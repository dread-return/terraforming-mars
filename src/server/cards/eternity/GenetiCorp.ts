import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

export class GenetiCorp extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GENETICORP,
      tags: [Tag.ANIMAL, Tag.SCIENCE],
      startingMegaCredits: 48,
      initialActionText: 'Draw an animal or science card',
      cardDiscount: {tag: Tag.SCIENCE, amount: 2},
      behavior: {
        production: {plants: 1},
      },
      action: {
        spend: {plants: 1},
        addResourcesToAnyCard: {count: 1, type: CardResource.ANIMAL},
      },
      metadata: {
        cardNumber: 'EC12',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48).production((pb) => pb.plants(1)).cards(1).asterix().br;
          b.effect('When you play a science tag, you pay 2 M€ less for it.', (eb) => eb.tag(Tag.SCIENCE).startEffect.megacredits(-2)).br;
          b.action('Spend 1 plant to add 1 animal to any card.', (eb) => eb.plants(1).startAction.resource(CardResource.ANIMAL).asterix());
        }),
        description: 'You start with 48 M\u20ac and 1 plant production. First action: draw an animal or science card.',
      },
    });
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(1, {include: (card) => card.tags.includes(Tag.ANIMAL) || card.tags.includes(Tag.SCIENCE)});
    return undefined;
  }
}
