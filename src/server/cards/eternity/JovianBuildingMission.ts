import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class JovianBuildingMission extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.JOVIAN_BUILDING_MISSION,
      tags: [Tag.BUILDING, Tag.JOVIAN, Tag.EARTH],
      cost: 9,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E20',
        renderData: CardRenderer.builder((b) => {
          b.vpText('1 VP.');
        }),
      },
    });
  }
}
