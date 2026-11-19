import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';

const PLANETARY_TAGS = [Tag.EARTH, Tag.VENUS, Tag.JOVIAN, Tag.MOON, Tag.MERCURY, Tag.MARS];

export class ImperioSolarMarciano extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.IMPERIO_SOLAR_MARCIANO,
      tags: [Tag.MARS],
      startingMegaCredits: 20,
      victoryPoints: {tag: Tag.MARS},

      behavior: {
        production: {megacredits: -1},
      },

      metadata: {
        cardNumber: 'EP-ISM',
        description: 'You start with 20 M€ and -1 M€ production. 1 VP per Mars tag you have.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(20).production((pb) => pb.megacredits(-1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.noTags().asterix().startEffect.megacredits(-2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Cards with no planet tags cost 2 M€ less. Cards with a planet tag other than Mars cost 4 M€ more.', (eb) => {
              eb.tag(Tag.EARTH).slash().tag(Tag.JOVIAN).slash().tag(Tag.VENUS).asterix().startEffect.megacredits(4);
            });
          });
        }),
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    const planetary = card.tags.filter((t) => PLANETARY_TAGS.includes(t));
    if (planetary.length === 0) {
      return 2;
    }
    return planetary.some((t) => t !== Tag.MARS) ? -4 : 0;
  }
}
