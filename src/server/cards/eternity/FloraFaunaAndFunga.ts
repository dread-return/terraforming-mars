import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {EternityUtils} from './EternityUtils';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class FloraFaunaAndFunga extends PreludeCard {
  constructor() {
    super({
      name: CardName.FLORA_FAUNA_AND_FUNGA,
      tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT],
      behavior: {
        production: {plants: 1},
      },
      metadata: {
        cardNumber: 'EP16',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1)).br.cards(1, {secondaryTag: Tag.MICROBE}).resource(CardResource.MICROBE, {amount: 2, digit}).nbsp.cards(1, {secondaryTag: Tag.ANIMAL}).resource(CardResource.ANIMAL, {amount: 2, digit});
        }),
        description: 'Increase your plant production 1 step. Reveal cards until you reveal a microbe card and an animal card; take them. You may play them with global requirements +/- 4 steps (not oceans); when you play each, add 2 of its resources to it.',
      },
    });
  }

  public data: {cards: Array<string>} = {cards: []};
  public override bespokePlay(player: IPlayer) {
    EternityUtils.drawThen(player, 1, {tag: Tag.MICROBE}, (cards) => {
      this.data = {cards: [...this.data.cards, ...cards.map((c) => c.name)]};
    });
    EternityUtils.drawThen(player, 1, {tag: Tag.ANIMAL}, (cards) => {
      this.data = {cards: [...this.data.cards, ...cards.map((c) => c.name)]};
    });
    return undefined;
  }
  public globalRequirementBonusFor(_player: IPlayer, card: ICard, parameter: GlobalParameter): number {
    return (this.data.cards.includes(card.name) && parameter !== GlobalParameter.OCEANS) ? 4 : 0;
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    if (!this.data.cards.includes(card.name)) {
      return undefined;
    }
    this.data = {cards: this.data.cards.filter((n) => n !== card.name)};
    if (card.resourceType !== undefined) {
      player.addResourceTo(card, {qty: 2, log: true});
    }
    return undefined;
  }
}
