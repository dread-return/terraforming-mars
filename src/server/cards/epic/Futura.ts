import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

export class Futura extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FUTURA,
      tags: [Tag.EARTH],
      startingMegaCredits: 41,

      metadata: {
        cardNumber: 'EP-FUT',
        description: 'You start with 41 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(41);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.plate('Standard projects').startEffect.megacredits(-2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Standard projects cost 2 M€ less. After one, you may take an additional action.', (eb) => {
              eb.plate('Standard projects').startEffect.text('+1 action');
            });
          });
        }),
      },
    });
  }

  public getStandardProjectDiscount() {
    return 2;
  }

  public onStandardProject(player: IPlayer) {
    // The standard project doesn't use up one of this turn's actions.
    player.freeActionTaken = true;
  }
}
