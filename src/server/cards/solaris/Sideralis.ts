import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SpaceName} from '../../../common/boards/SpaceName';

export class Sideralis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SIDERALIS,
      tags: [Tag.JOVIAN, Tag.CITY, Tag.SPACE],
      cost: 29,
      victoryPoints: {cities: {where: 'offmars'}, all: false},

      behavior: {
        production: {titanium: 1, megacredits: 4},
        city: {space: SpaceName.SIDERALIS},
      },

      metadata: {
        cardNumber: 'S11',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(1).megacredits(4)).nbsp.city().asterix();
        }),
        description: {
          text: 'Requires that you have an off-world city. Increase your titanium production 1 step and your M€ production 4 steps. ' +
            'Place a city tile ON THE RESERVED AREA. 1 VP for each off-world city you have, including this.',
          align: 'left',
        },
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.game.board.getCitiesOffMars(player).length > 0;
  }
}
