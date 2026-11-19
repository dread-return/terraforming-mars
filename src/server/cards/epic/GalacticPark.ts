import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class GalacticPark extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GALACTIC_PARK,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 40,
      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-GAP',
        description: 'You start with 40 M€ and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.PLANT).startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('When you play a plant tag, gain 2 M€; an animal tag, including this, +1 M€ production.', (eb) => {
              eb.tag(Tag.ANIMAL).startEffect.production((pb) => pb.megacredits(1));
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const plants = player.tags.cardTagCount(card, Tag.PLANT);
    const animals = player.tags.cardTagCount(card, Tag.ANIMAL);
    if (plants > 0) {
      player.stock.add(Resource.MEGACREDITS, 2 * plants, {log: true, from: {card: this}});
    }
    if (animals > 0) {
      player.production.add(Resource.MEGACREDITS, animals, {log: true, from: {card: this}});
    }
  }
}
