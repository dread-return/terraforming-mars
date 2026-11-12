import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {TileType} from '../../../common/TileType';
import {UPGRADE_COST} from '../../../common/domesWilderness/DomesWilderness';
import {UpgradeTile} from '../../deferredActions/UpgradeTile';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';

/**
 * Domes and Wilderness (Epic): puts a dome on one of the player's cities on Mars and raises their M€,
 * plant and heat production 1 step each. The city counts as two cities for cards and effects.
 */
export class DomeStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.DOME_STANDARD_PROJECT,
      cost: UPGRADE_COST.dome,
      metadata: {
        cardNumber: 'SP',
        renderData: CardRenderer.builder((b) =>
          b.standardProject(
            'Spend 20 M€ to place a dome on one of your cities on Mars and raise your M€, plant and heat production 1 step each. ' +
            'The city counts as two cities for cards and effects, and as a city when scoring. ' +
            'The city, and tiles of yours next to it, lose no production to hazards.', (eb) => {
              eb.megacredits(UPGRADE_COST.dome).asterix().startAction.tile(TileType.DOME).production((pb) => {
                pb.megacredits(1).plants(1).heat(1);
              });
            }),
        ),
      },
    });
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    return DomesWilderness.upgradeableCities(player).length > 0;
  }

  public actionEssence(player: IPlayer): void {
    player.game.defer(new UpgradeTile(player, 'dome'));
  }
}
