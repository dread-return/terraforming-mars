import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class ShinraTechnologies extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SHINRA_TECHNOLOGIES,
      tags: [Tag.POWER],
      startingMegaCredits: 42,
      behavior: {
        production: {energy: 2},
      },

      metadata: {
        cardNumber: 'EP-SHI',
        description: 'You start with 2 energy production and 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2)).megacredits(42).br;
          b.effect('When you play a power tag, including this one, increase your M€ production 1 step.', (eb) => {
            eb.tag(Tag.POWER).startEffect.production((pb) => pb.megacredits(1));
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.POWER);
    if (count > 0) {
      player.production.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
    }
  }
}
