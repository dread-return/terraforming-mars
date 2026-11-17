import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';
import {BuildColony} from '../../deferredActions/BuildColony';
import {ColonyName} from '../../../common/colonies/ColonyName';

export class EtherEnterprise extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ETHER_ENTERPRISE,
      tags: [Tag.MERCURY, Tag.SPACE],
      startingMegaCredits: 40,
      initialActionText: 'Place a colony (on Venus if it is in play)',

      metadata: {
        cardNumber: 'EP-ETH',
        description: 'You start with 40 M€. First action: place a colony, on the Venus colony if it is in play.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).colonies(1).asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any player trades, gain 1 of that colony\'s trade income.', (eb) => {
              eb.trade({all}).startEffect.text('+1 income', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const venus = player.game.colonies.find((c) => c.name === ColonyName.VENUS && c.isActive && !c.isFull() && !c.colonies.includes(player.id));
    player.game.defer(new BuildColony(player, venus !== undefined ? {colonies: [venus]} : undefined));
    return undefined;
  }
  // The trade effect is in EpicHooks.onTrade.
}
