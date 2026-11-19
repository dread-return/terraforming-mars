import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {digit} from '../Options';
import {SelectSpace} from '../../inputs/SelectSpace';

export class PolyPlantae extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.POLY_PLANTAE,
      tags: [Tag.SCIENCE, Tag.PLANT],
      startingMegaCredits: 40,
      action: {},

      behavior: {
        stock: {titanium: 6},
      },

      metadata: {
        cardNumber: 'EP-PPL',
        description: 'You start with 40 M€ and 6 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).titanium(6, {digit});
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend 13 M€ (titanium may be used) to place a greenery. It does NOT raise oxygen.', (eb) => {
              eb.megacredits(13).super((sb) => sb.titanium(1)).startAction.greenery({withO2: false}).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford({cost: 13, titanium: true}) && player.game.board.getAvailableSpacesForGreenery(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 13, {canUseTitanium: true, title: 'Poly Plantae: pay for the greenery'})
      .andThen(() => {
        player.defer(new SelectSpace('Poly Plantae: place a greenery (no oxygen)', player.game.board.getAvailableSpacesForGreenery(player))
          .andThen((space) => {
            player.game.addGreenery(player, space, false);
            return undefined;
          }));
      }));
    return undefined;
  }
}
