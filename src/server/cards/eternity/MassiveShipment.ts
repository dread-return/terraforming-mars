import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class MassiveShipment extends PreludeCard {
  constructor() {
    super({
      name: CardName.MASSIVE_SHIPMENT,
      tags: [Tag.SPACE, Tag.SPACE],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'EP34',
        renderData: CardRenderer.builder((b) => {
          b.text('Counts as 2 preludes. If it is your last prelude play, play the top prelude instead.', {size: Size.SMALL, isBold: false}).br;
          b.cards(4).text('10').wild(1);
        }),
        description: 'Draw 4 cards. Gain 10 standard resources.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EternityUtils.playDoublePrelude(player, this, () => {
      player.drawCard(4);
      for (let i = 0; i < 10; i++) {
        player.defer(new OrOptions(...[Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT].map((r) =>
          new SelectOption(r).andThen(() => {
            player.stock.add(r, 1, {log: true});
            return undefined;
          }))).setTitle('Gain a standard resource (' + (i + 1) + ' of 10)'));
      }
    });
    return undefined;
  }
}
