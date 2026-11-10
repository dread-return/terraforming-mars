import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {EternityUtils} from './EternityUtils';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class AnimalsFromHome extends PreludeCard {
  constructor() {
    super({
      name: CardName.ANIMALS_FROM_HOME,
      tags: [Tag.EARTH, Tag.ANIMAL],
      resourceType: CardResource.ANIMAL,
      behavior: {
        production: {plants: 1},
        addResources: 2,
      },
      metadata: {
        cardNumber: 'EP06',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.ANIMAL}).resource(CardResource.ANIMAL, 2).production((pb) => pb.plants(1)).br.text('When you play that card, move these animals onto it.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Increase your plant production 1 step. Add 2 animals here. Reveal cards until you reveal an animal card that holds animals; take it (shuffle the rest back). When you play it, move all animals from here onto it.',
      },
    });
  }

  public data: {card?: string} = {};
  public override bespokePlay(player: IPlayer) {
    EternityUtils.drawThen(player, 1, {tag: Tag.ANIMAL, resource: CardResource.ANIMAL}, (cards) => {
      if (cards[0] !== undefined) {
        this.data = {card: cards[0].name};
      }
    });
    return undefined;
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.name === this.data.card && this.resourceCount > 0) {
      const n = this.resourceCount;
      player.removeResourceFrom(this, n);
      player.addResourceTo(card, {qty: n, log: true});
      this.data = {};
    }
    return undefined;
  }
}
