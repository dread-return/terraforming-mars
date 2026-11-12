import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';

export class Slum extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SLUM,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 7,
      victoryPoints: -1,

      behavior: {
        production: {energy: -1, megacredits: 1},
        city: {},
      },

      metadata: {
        cardNumber: 'I57',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).br.megacredits(1)).nbsp.city();
        }),
        description: 'Requires that there are at most 3 cities on Mars. ' +
          'Decrease your energy production 1 step and increase your M€ production 1 step. Place a city tile.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return DomesWilderness.countCities(player.game.board.getCitiesOnMars()) <= 3;
  }
}
