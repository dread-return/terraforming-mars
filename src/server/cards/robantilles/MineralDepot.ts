import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {AndOptions} from '../../inputs/AndOptions';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Resource} from '../../../common/Resource';

export class MineralDepot extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MINERAL_DEPOT,
      tags: [],
      cost: 5,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'H55',
        renderData: CardRenderer.builder((b) => {
          b.steel(1).slash().titanium(1).arrow().megacredits(2).slash().megacredits(3).asterix();
        }),
        description: 'Exchange any number of steel for 2 M€ each and titanium for 3 M€ each, or buy them at those prices.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    let steel = 0;
    let titanium = 0;
    const sell = new AndOptions(
      new SelectAmount('Steel to sell (2 M€ each)', 'Sell', 0, player.steel).andThen((n) => {
        steel = n;
        return undefined;
      }),
      new SelectAmount('Titanium to sell (3 M€ each)', 'Sell', 0, player.titanium).andThen((n) => {
        titanium = n;
        return undefined;
      }),
    ).andThen(() => {
      player.stock.deduct(Resource.STEEL, steel);
      player.stock.deduct(Resource.TITANIUM, titanium);
      player.stock.add(Resource.MEGACREDITS, 2 * steel + 3 * titanium, {log: true});
      return undefined;
    });
    sell.title = 'Sell steel and titanium';

    const buy = new AndOptions(
      new SelectAmount('Steel to buy (2 M€ each)', 'Buy', 0, Math.floor(player.megaCredits / 2)).andThen((n) => {
        steel = n;
        return undefined;
      }),
      new SelectAmount('Titanium to buy (3 M€ each)', 'Buy', 0, Math.floor(player.megaCredits / 3)).andThen((n) => {
        titanium = n;
        return undefined;
      }),
    ).andThen(() => {
      const cost = 2 * steel + 3 * titanium;
      if (cost > player.megaCredits) {
        throw new Error('You do not have enough M€ for that');
      }
      player.stock.deduct(Resource.MEGACREDITS, cost);
      player.stock.add(Resource.STEEL, steel, {log: true});
      player.stock.add(Resource.TITANIUM, titanium, {log: true});
      return undefined;
    });
    buy.title = 'Buy steel and titanium';

    return new OrOptions(sell, buy);
  }
}
