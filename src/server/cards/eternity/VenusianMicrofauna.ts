import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class VenusianMicrofauna extends PreludeCard {
  constructor() {
    super({
      name: CardName.VENUSIAN_MICROFAUNA,
      tags: [Tag.VENUS, Tag.MICROBE],
      resourceType: CardResource.MICROBE,
      behavior: {
        global: {venus: 1},
        drawCard: {count: 2, tag: Tag.MICROBE, resource: CardResource.MICROBE},
        addResources: 3,
      },
      metadata: {
        cardNumber: 'EP65',
        renderData: CardRenderer.builder((b) => {
          b.venus(1).cards(2, {secondaryTag: Tag.MICROBE}).resource(CardResource.MICROBE, {amount: 3, digit});
        }),
        description: 'Raise Venus 1 step. Reveal cards until you reveal 2 microbe cards that hold microbes; take them. Place 3 microbes here (no other microbes can be added here). When you play a microbe card, you may move 1 microbe from here onto it.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this || this.resourceCount === 0 || !card.tags.includes(Tag.MICROBE) || card.resourceType !== CardResource.MICROBE) {
      return undefined;
    }
    return new OrOptions(
      new SelectOption('Move 1 microbe from Venusian Microfauna to ' + card.name).andThen(() => {
        player.removeResourceFrom(this, 1);
        player.addResourceTo(card, {qty: 1, log: true});
        return undefined;
      }),
      new SelectOption('Keep it'));
  }
}
