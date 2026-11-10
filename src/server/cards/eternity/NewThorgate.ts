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
            ce.effect('Power tags and the Power Plant project cost 3 M€ less.', (eb) => eb.tag(Tag.POWER).asterix().startEffect.megacredits(-3));
            ce.effect('Gain 2 M€ when ANY player raises energy production.', (eb) => eb.production((pb) => pb.energy(1, {all})).startEffect.megacredits(2));
            ce.effect('Gain 3 M€ per Earth tag you play, incl. this.', (eb) => eb.tag(Tag.EARTH).startEffect.megacredits(3));
          });
        }),
        description: 'You start with 41 M\u20ac. First action: +1 energy production.',
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
