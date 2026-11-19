import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {PlayerInput} from '../../PlayerInput';
import {sum} from '../../../common/utils/utils';

export class MMBio extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MMBIO,
      tags: [Tag.MICROBE, Tag.PLANT],
      startingMegaCredits: 42,
      resourceType: CardResource.MICROBE,
      action: {},

      metadata: {
        cardNumber: 'EP-MMB',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When you play a plant or microbe card, including this, add 2 microbes here.', (eb) => {
              eb.tag(Tag.MICROBE).slash().tag(Tag.PLANT).startEffect.resource(CardResource.MICROBE, 2);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Remove 4 of your microbes from anywhere to gain 4 plants.', (eb) => {
              eb.resource(CardResource.MICROBE, 4).asterix().startAction.plants(4, {digit});
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.tags.includes(Tag.PLANT) || card.tags.includes(Tag.MICROBE)) {
      player.addResourceTo(this, {qty: 2, log: true});
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return sum(player.getCardsWithResources(CardResource.MICROBE).map((c) => c.resourceCount)) >= 4;
  }

  private remove(player: IPlayer, remaining: number): PlayerInput | undefined {
    if (remaining <= 0) {
      player.stock.add(Resource.PLANTS, 4, {log: true});
      return undefined;
    }
    const cards = player.getCardsWithResources(CardResource.MICROBE);
    const removeFrom = (card: ICard) => {
      const qty = Math.min(remaining, card.resourceCount);
      player.removeResourceFrom(card, qty, {log: true});
      return this.remove(player, remaining - qty);
    };
    if (cards.length === 1) {
      return removeFrom(cards[0]);
    }
    return new SelectCard(`Select a card to remove microbes from (${remaining} left)`, 'Remove microbes', cards)
      .andThen(([card]) => removeFrom(card));
  }

  public override bespokeAction(player: IPlayer) {
    return this.remove(player, 4);
  }
}
