import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {InfrastructureCard} from './InfrastructureCard';

export class OrbitalShipyard extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.ORBITAL_SHIPYARD, copy, {
      tags: [Tag.SPACE],
      metadata: {
        cardNumber: 'HO26',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play an infrastructure tag, including this, gain 2 M€.', (eb) => eb.tag(Tag.INFRASTRUCTURE).startEffect.megacredits(2));
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.INFRASTRUCTURE).length;
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, 2 * count, {log: true, from: {card: this}});
    }
    return undefined;
  }
}
