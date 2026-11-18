import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class SteelRidgeConstructions extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.STEEL_RIDGE_CONSTRUCTIONS,
      tags: [Tag.CITY, Tag.BUILDING],
      startingMegaCredits: 32,
      cardDiscount: {tag: Tag.CITY, per: 'card', amount: 3},

      firstAction: {
        text: 'Reveal cards until you reveal one with a city tag, and take it',
        drawCard: {count: 1, tag: Tag.CITY},
      },

      metadata: {
        cardNumber: 'EP-SRC',
        description: 'You start with 32 M€. First action: reveal cards until a city tag; take it.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).cards(1, {secondaryTag: Tag.CITY});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Cities anywhere (even next to cities).', (eb) => {
              eb.city({size: Size.SMALL}).startEffect.text('anywhere', {size: Size.SMALL}).asterix();
            });
            ce.vSpace(Size.SMALL);
            ce.effect('City cards and city project: -3 M€.', (eb) => {
              eb.tag(Tag.CITY).slash().text('SP').city({size: Size.SMALL}).startEffect.megacredits(-3);
            });
          });
        }),
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, project: IStandardProjectCard) {
    return project.name === CardName.CITY_STANDARD_PROJECT ? 3 : 0;
  }
  // Placement is in MarsBoard (EpicHooks.ignoresCityPlacement).
}
