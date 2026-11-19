import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';

export class SpacePenalColonies extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SPACE_PENAL_COLONIES,
      tags: [Tag.CITY, Tag.SPACE],
      startingMegaCredits: 42,
      resourceType: CardResource.PRISONER,

      behavior: {
        production: {steel: 1},
      },

      firstAction: {
        text: 'Place a city tile',
        city: {},
      },

      metadata: {
        cardNumber: 'EP-SPC',
        description: 'You start with 42 M€ and 1 steel production. First action: place a city.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(42).production((pb) => pb.steel(1)).city();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Your space tags (incl. this): +1 prisoner here.', (eb) => {
              eb.tag(Tag.SPACE).startEffect.resource(CardResource.PRISONER);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Prisoners here may count as wild tags for tag requirements.', (eb) => {
              eb.minus().resource(CardResource.PRISONER).text('x').startEffect.wild(1).text('x');
            });
          });
        }),
      },
    });
  }

  public data: {spend?: Record<string, number>} = {};

  public onCardPlayed(player: IPlayer, card: ICard) {
    const spend = this.data.spend?.[card.name] ?? 0;
    this.data.spend = {};
    if (spend > 0) {
      player.removeResourceFrom(this, Math.min(spend, this.resourceCount), {log: true});
    }
    const space = player.tags.cardTagCount(card, Tag.SPACE);
    if (space > 0) {
      player.addResourceTo(this, {qty: space, log: true});
    }
  }
  // Requirements are in EpicHooks.extraTagsForRequirement.
}
