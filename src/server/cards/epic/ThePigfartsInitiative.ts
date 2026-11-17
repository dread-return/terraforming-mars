import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class ThePigfartsInitiative extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.THE_PIGFARTS_INITIATIVE,
      tags: [Tag.BUILDING],
      startingMegaCredits: 35,

      firstAction: {
        text: 'Take the City standard project for free',
        city: {},
        production: {megacredits: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-PIG',
        description: 'You start with 35 M€. First action: the City standard project, for free.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(35).plate('City').asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Pay 3 M€ to draw 1 card per city you own. Keep one and discard the rest.', (eb) => {
              eb.megacredits(3).startAction.cards(1).slash().city({size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford(3) && player.game.board.getCities(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.deduct(Resource.MEGACREDITS, 3, {log: true});
    const count = player.game.board.getCities(player).length;
    player.drawCardKeepSome(count, {keepMax: 1});
    return undefined;
  }
}
