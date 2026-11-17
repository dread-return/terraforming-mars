import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {SelectResource} from '../../inputs/SelectResource';

export class TradeFleetUpgrades extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.TRADE_FLEET_UPGRADES,
      type: CardType.AUTOMATED,
      tags: [Tag.SPACE],
      cost: 18,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'MM35',
        renderData: CardRenderer.builder((b) => {
          b.asset(1).wild(1).slash().colonies(1);
        }),
        description: 'Add 1 asset to an Act and gain 1 standard resource for every colony you own.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    Mercury.gainAssets(player, 1);
    const colonies = player.getColoniesCount();
    for (let i = 0; i < colonies; i++) {
      player.defer(new SelectResource('Gain 1 standard resource').andThen((unit) => {
        player.stock.add(unit, 1, {log: true});
        return undefined;
      }));
    }
    return undefined;
  }
}
