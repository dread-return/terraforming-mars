import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {cities} from '../render/DynamicVictoryPoints';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';

export class RooftopGardensOfNoctis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ROOFTOP_GARDENS_OF_NOCTIS,
      tags: [Tag.MARS, Tag.PLANT],
      cost: 30,
      victoryPoints: 'special',

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'H25',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1)).br;
          b.vpText('1 VP per city you own on Mars.');
        }),
        description: 'Increase your plant production 1 step.',
        victoryPoints: cities(1, 1),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return DomesWilderness.countCities(player.game.board.getCitiesOnMars(player));
  }
}
