import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';

export class PlanetWave extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PLANET_WAVE,
      tags: [Tag.EARTH],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'EP-PWV',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).startEffect.text('yours', {size: Size.SMALL}).asterix();
            });
            ce.vSpace(Size.SMALL);
            ce.effect('*Oceans count as your tiles for placing greeneries. Ocean adjacency bonus is 4 M€ for you.', (eb) => {
              eb.oceans(1, {size: Size.SMALL}).emptyTile('normal', {size: Size.SMALL}).startEffect.megacredits(4);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.oceanBonus = 4;
    return undefined;
  }
  // Placement is in MarsBoard.getAvailableSpacesForGreenery.
}
