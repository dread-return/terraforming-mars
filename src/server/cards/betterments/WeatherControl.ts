import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {BettermentsUtils} from './BettermentsUtils';
import {all} from '../Options';

export class WeatherControl extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.WEATHER_CONTROL,
      tags: [Tag.SPACE],
      cost: 6,

      metadata: {
        cardNumber: 'B08',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(2).slash().emptyTile().br;
          b.megacredits(1, {all}).slash().emptyTile('normal', {all});
        }),
        description: 'Gain 2 M€ for each tile you own on Mars. Each other player gains 1 M€ for each tile they own on Mars.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2 * BettermentsUtils.tilesOnMars(player).length, {log: true});
    for (const opponent of player.opponents) {
      opponent.stock.add(Resource.MEGACREDITS, BettermentsUtils.tilesOnMars(opponent).length, {log: true});
    }
    return undefined;
  }
}
