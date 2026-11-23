import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {MAX_FLEET_SIZE} from '../../../common/constants';
import {CardRenderer} from '../render/CardRenderer';
import {StandardProjectCard} from '../StandardProjectCard';

const BASE_COST = 20;
const COST_STEP = 5;

/**
 * Colonies variant: adds one trade fleet. Each fleet bought this way costs 5 M€ more than the last one
 * (20, 25, 30); fleets from cards don't change the price. Unavailable at the maximum fleet size.
 */
export class TradeFleetStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.TRADE_FLEET_STANDARD_PROJECT,
      cost: BASE_COST,
      metadata: {
        cardNumber: 'SP',
        renderData: CardRenderer.builder((b) =>
          b.standardProject(
            `Spend ${BASE_COST} M€ to gain a trade fleet. Each trade fleet you buy this way costs ${COST_STEP} M€ more than the last.`, (eb) => {
              eb.megacredits(BASE_COST).asterix().startAction.tradeFleet();
            }),
        ),
      },
    });
  }

  protected override discount(player: IPlayer): number {
    return -COST_STEP * player.colonies.fleetsBought;
  }

  protected override bespokeCanAct(player: IPlayer): boolean {
    return player.colonies.getFleetSize() < MAX_FLEET_SIZE;
  }

  public actionEssence(player: IPlayer): void {
    player.colonies.increaseFleetSize();
    player.colonies.fleetsBought++;
  }
}
