import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class NewThorgate extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NEW_THORGATE,
      tags: [Tag.POWER, Tag.EARTH],
      startingMegaCredits: 41,
      cardDiscount: {tag: Tag.POWER, amount: 3},
      firstAction: {
        text: 'Increase your energy production 1 step',
        production: {energy: 1},
      },
      metadata: {
        cardNumber: 'EC17',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).production((pb) => pb.energy(1)).asterix().br;
          b.corpBox('effect', (ce) => {
            ce.effect('Power cards & Power Plant SP cost 3 M€ less. +3 M€ per Earth tag you play.', (eb) => eb.tag(Tag.POWER).asterix().colon().megacredits(-3).nbsp.tag(Tag.EARTH).startEffect.megacredits(3));
            ce.effect('Anyone +energy prod.: +2 M€.', (eb) => eb.production((pb) => pb.energy(1, {all})).startEffect.megacredits(2));
          });
        }),
        description: 'First action: +1 energy production.',
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard) {
    return card.name === CardName.POWER_PLANT_STANDARD_PROJECT ? 3 : 0;
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.EARTH).length;
    if (n > 0) {
      player.stock.add(Resource.MEGACREDITS, 3 * n, {log: true});
    }
    return undefined;
  }
}
