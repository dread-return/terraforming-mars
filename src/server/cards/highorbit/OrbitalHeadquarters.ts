import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {HighOrbit} from '../../highOrbit/HighOrbit';
import {InfrastructureCard} from './InfrastructureCard';

export class OrbitalHeadquarters extends InfrastructureCard {
  constructor(copy: number = 1) {
    super(CardName.ORBITAL_HEADQUARTERS, copy, {
      tags: [Tag.SPACE],
      behavior: {
        stock: {megacredits: 10},
      },
      metadata: {
        cardNumber: 'INF18',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you play a card with a tag matching one of your corporations, gain 1 M€.', (eb) => eb.text('corp tag').startEffect.megacredits(1)).br;
          b.megacredits(10);
        }),
        description: 'Gain 10 M€. Max 1 per player.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return HighOrbit.countOwned(player, CardName.ORBITAL_HEADQUARTERS) === 0;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const corpTags = new Set<Tag>();
    for (const corp of player.playedCards.corporations()) {
      for (const tag of corp.tags) {
        if (tag !== Tag.WILD) {
          corpTags.add(tag);
        }
      }
    }
    // Epic: 1 M€ per card, however many tags match.
    if (card.tags.some((tag) => corpTags.has(tag))) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
    return undefined;
  }
}
