import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class CarbonNanosystemsEpic extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CARBON_NANOSYSTEMS_EPIC,
      tags: [Tag.SCIENCE, Tag.SPACE],
      startingMegaCredits: 35,
      resourceType: CardResource.GRAPHENE,

      // Its own science tag.
      behavior: {
        addResources: 1,
      },

      action: {
        addResources: 1,
      },

      metadata: {
        cardNumber: 'EP-CNS',
        description: 'You start with 35 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(35);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Add a graphene here.', (eb) => {
              eb.empty().startAction.resource(CardResource.GRAPHENE);
            });
            ce.vSpace(Size.TINY);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.SCIENCE).asterix().startEffect.resource(CardResource.GRAPHENE);
            });
            ce.vSpace(Size.TINY);
            ce.effect('*Your science tags, including this: add a graphene here. Graphene: 4 M€ for space and city cards.', (eb) => {
              eb.tag(Tag.SPACE).slash().tag(Tag.CITY).startEffect.resource(CardResource.GRAPHENE).text('=').megacredits(4);
            });
          });
        }),
      },
    });
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    const qty = player.tags.cardTagCount(card, Tag.SCIENCE);
    if (qty > 0) {
      player.addResourceTo(this, {qty, log: true});
    }
  }
  // Payment is in Player.paymentOptionsForCard / getSpendable / pay (EpicHooks.canUseGraphene).
}
