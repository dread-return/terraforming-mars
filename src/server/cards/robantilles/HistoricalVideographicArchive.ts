import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {tag as tagVP} from '../render/DynamicVictoryPoints';

export class HistoricalVideographicArchive extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.HISTORICAL_VIDEOGRAPHIC_ARCHIVE,
      tags: [Tag.EARTH],
      cost: 18,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'H03',
        renderData: CardRenderer.builder((b) => {
          b.vpText('1 VP for every 3 event cards you have played.');
        }),
        victoryPoints: tagVP(Tag.EVENT, 1, 3),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return Math.floor(player.getPlayedEventsCount() / 3);
  }
}
