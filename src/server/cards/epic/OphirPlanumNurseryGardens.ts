import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class OphirPlanumNurseryGardens extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OPHIR_PLANUM_NURSERY_GARDENS,
      tags: [Tag.PLANT],
      startingMegaCredits: 38,
      victoryPoints: {tag: Tag.PLANT, per: 2},
      behavior: {
        stock: {plants: 1},
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-OPN',
        description: 'You start with 38 M€, 1 plant and 1 plant production. 1 VP per 2 plant tags you have.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38).plants(1).production((pb) => pb.plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any plant tag is played, gain 1 plant.', (eb) => {
              eb.tag(Tag.PLANT, {all}).startEffect.plants(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = thisCardOwner.tags.cardTagCount(card, Tag.PLANT);
    if (count > 0) {
      thisCardOwner.stock.add(Resource.PLANTS, count, {log: true, from: {card: this}});
    }
  }
}
