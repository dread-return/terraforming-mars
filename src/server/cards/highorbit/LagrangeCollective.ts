import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {HighOrbit} from '../../highOrbit/HighOrbit';

export class LagrangeCollective extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LAGRANGE_COLLECTIVE,
      tags: [Tag.INFRASTRUCTURE],
      startingMegaCredits: 46,
      initialActionText: 'Place an Orbital Headquarters in play for free',
      // Its own infrastructure tag ("including this").
      behavior: {
        production: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'HO77',
        description: 'You start with 46 M€. As your first action, place an Orbital Headquarters card in play for free.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(46).nbsp.text('Orbital HQ').asterix();
          b.corpBox('effect', (ce) => {
            ce.effect('When you play an infrastructure tag, including this, increase your M€ production 1 step.', (eb) => {
              eb.tag(Tag.INFRASTRUCTURE).startEffect.production((pb) => pb.megacredits(1));
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    HighOrbit.placeForFree(player, CardName.ORBITAL_HEADQUARTERS);
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this) {
      return undefined;
    }
    const count = card.tags.filter((tag) => tag === Tag.INFRASTRUCTURE).length;
    if (count > 0) {
      player.production.add(Resource.MEGACREDITS, count, {log: true});
    }
    return undefined;
  }
}
