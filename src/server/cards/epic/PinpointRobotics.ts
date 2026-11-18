import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class PinpointRobotics extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PINPOINT_ROBOTICS,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 42,

      behavior: {
        production: {energy: 1},
      },

      metadata: {
        cardNumber: 'EP-PPR',
        description: 'You start with 42 M€ and 1 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).production((pb) => pb.energy(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play a card that raises AND lowers your productions, +1 to one of the raised ones.', (eb) => {
              eb.production((pb) => pb.text('+X').text('-Y')).startEffect.production((pb) => pb.text('+X'));
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    const units = card.behavior?.production;
    if (units === undefined || typeof units !== 'object') {
      return;
    }
    const entries = Object.entries(units).filter((e): e is [Resource, number] => typeof e[1] === 'number');
    const raised = entries.filter(([, n]) => n > 0).map(([r]) => r);
    const lowered = entries.some(([, n]) => n < 0);
    if (raised.length === 0 || !lowered) {
      return;
    }
    const options = raised.map((r) => new SelectOption(`Pinpoint Robotics: +1 ${r} production`).andThen(() => {
      player.production.add(r, 1, {log: true});
      return undefined;
    }));
    player.defer(options.length === 1 ? options[0] : new OrOptions(...options));
  }
}
