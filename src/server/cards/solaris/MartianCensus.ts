import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

/** S31. Cities you own anywhere, off-world ones included. */
export class MartianCensus extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MARTIAN_CENSUS,
      tags: [],
      cost: 9,
      requirements: {party: PartyName.POPULISTS},

      metadata: {
        cardNumber: 'S31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).slash().partyLeaders().br;
          b.megacredits(1).slash().city().asterix();
        }),
        description: 'Requires Populists ruling or 2 delegates there. +1 M€ production per party leader you have. Gain 1 M€ per city you own.',
      },
    });
  }

  public static leaders(player: IPlayer): number {
    return player.game.turmoil?.parties.filter((party) => party.partyLeader === player).length ?? 0;
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, MartianCensus.leaders(player), {log: true});
    player.stock.add(Resource.MEGACREDITS, player.game.board.getCities(player).length, {log: true});
    return undefined;
  }
}
