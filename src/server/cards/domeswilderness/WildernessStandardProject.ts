import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {TileType} from '../../../common/TileType';
import {UPGRADE_COST} from '../../../common/domesWilderness/DomesWilderness';
import {UpgradeTile} from '../../deferredActions/UpgradeTile';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';

/**
 * Domes and Wilderness (Epic): puts a wilderness on one of the player's greeneries, raises their TR 1 step and
 * gives them a plant, a microbe and an animal. The greenery counts as two greeneries for cards and effects.
 */
export class WildernessStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.WILDERNESS_STANDARD_PROJECT,
      cost: UPGRADE_COST.wilderness,
      tr: {tr: 1},
      metadata: {
        cardNumber: 'SP',
        renderData: CardRenderer.builder((b) =>
          b.standardProject(
            'Spend 23 M€ to place a wilderness on one of your greeneries, raise your TR 1 step, and gain 1 plant, 1 microbe and 1 animal. ' +
            'The greenery counts as two greeneries for cards and effects, and as a greenery when scoring.', (eb) => {
              eb.megacredits(UPGRADE_COST.wilderness).asterix().startAction.tile(TileType.WILDERNESS).tr(1).plants(1)
                .resource(CardResource.MICROBE).resource(CardResource.ANIMAL);
            }),
        ),
      },
    });
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    return DomesWilderness.upgradeableGreeneries(player).length > 0;
  }

  public actionEssence(player: IPlayer): void {
    player.game.defer(new UpgradeTile(player, 'wilderness'));
  }
}
