import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardType} from '../../../common/cards/CardType';

export class Pallas extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PALLAS,
      tags: [Tag.SPACE],
      startingMegaCredits: 36,
      behavior: {
        production: {titanium: 1},
      },
      action: {
        spend: {titanium: 4},
        global: {temperature: 1},
        removeAnyPlants: 2,
      },

      metadata: {
        cardNumber: 'EP-PAL',
        description: 'You start with 36 M€ and 1 titanium production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(36).production((pb) => pb.titanium(1));
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Space events cost you 2 M€ less.', (eb) => {
              eb.tag(Tag.SPACE).tag(Tag.EVENT).startEffect.megacredits(-2);
            });
            ce.vSpace(Size.SMALL);
            ce.action('4 titanium: raise temperature 1 step; remove up to 2 plants from anyone.', (eb) => {
              eb.titanium(4, {digit}).startAction.temperature(1).minus().plants(2, {all});
            });
          });
        }),
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return card.type === CardType.EVENT && card.tags.includes(Tag.SPACE) ? 2 : 0;
  }
}
