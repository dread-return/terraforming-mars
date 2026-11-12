import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {greeneries} from './RobAntillesRender';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';

export class TempleOfGaiaAtElysium extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TEMPLE_OF_GAIA_AT_ELYSIUM,
      tags: [Tag.MARS, Tag.BUILDING, Tag.PLANT],
      cost: 25,
      requirements: {party: PartyName.GREENS},
      victoryPoints: 'special',

      behavior: {
        production: {plants: {greeneries: {}, all: false}},
      },

      metadata: {
        cardNumber: 'H31',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1).slash().greenery()).br;
          b.vpText('1 VP per 3 greenery tiles you own.');
        }),
        description: 'Requires that Greens are ruling or that you have 2 delegates there. ' +
          'Increase your plant production 1 step for each greenery tile you own.',
        victoryPoints: greeneries(1, 3),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return Math.floor(DomesWilderness.countGreeneries(player.game.board.getGreeneries(player)) / 3);
  }
}
