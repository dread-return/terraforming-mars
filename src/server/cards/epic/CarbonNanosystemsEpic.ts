import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class CarbonNanosystemsEpic extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CARBON_NANOSYSTEMS_EPIC,
      tags: [Tag.SCIENCE, Tag.SPACE],
      startingMegaCredits: 35,
      resourceType: CardResource.GRAPHENE,

      behavior: {
        addResources: 2,
      },

      action: {
        addResources: 1,
      },

      metadata: {
        cardNumber: 'EP-CNS',
        description: 'You start with 35 M€ and 2 graphene here.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(35).resource(CardResource.GRAPHENE, 2);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Add a graphene here.', (eb) => {
              eb.empty().startAction.resource(CardResource.GRAPHENE);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Graphene is worth 5 M€ for cards with space or building tags.', (eb) => {
              eb.resource(CardResource.GRAPHENE).text('=').megacredits(5).startEffect.tag(Tag.SPACE).slash().tag(Tag.BUILDING);
            });
          });
        }),
      },
    });
  }
  // Payment is in Player.paymentOptionsForCard / getSpendable / pay (EpicHooks.canUseGraphene, grapheneValue).
}
