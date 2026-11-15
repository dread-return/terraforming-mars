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
        cardNumber: 'HO04',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a tag that matches a tag on your corporation, gain 1 M€.', (eb) => eb.text('corp tag').startEffect.megacredits(1)).br;
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
    const count = card.tags.filter((tag) => corpTags.has(tag)).length;
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
    }
    return undefined;
  }
}
