import {CardName} from '../../../common/cards/CardName';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';
import {productionOf} from '../render/DynamicVictoryPoints';

export class LivingEnergyStructures extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.LIVING_ENERGY_STRUCTURES,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 9,
      requirements: {tag: Tag.BUILDING, count: 3},
      victoryPoints: 'special',
      behavior: {
        production: {energy: 1},
      },
      metadata: {
        cardNumber: 'E84',
        victoryPoints: productionOf(CardRenderItemType.ENERGY, 1, 3),
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 5 energy: raise a global parameter 1 step or place an ocean.', (eb) => eb.energy(5, {digit}).startAction.wrap.temperature(1).slash().oxygen(1).slash().oceans(1).asterix()).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Requires 3 building tags. Increase your energy production 1 step. 1 VP per 3 energy production you have.',
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return Math.floor(player.production.energy / 3);
  }
  public canAct(player: IPlayer) {
    return player.energy >= 5;
  }
  public action(player: IPlayer) {
    const game = player.game;
    const pay = () => player.stock.deduct(Resource.ENERGY, 5);
    const options = [
      new SelectOption('Raise the temperature 1 step').andThen(() => {
        pay(); game.increaseTemperature(player, 1); return undefined;
      }),
      new SelectOption('Raise oxygen 1 step').andThen(() => {
        pay(); game.increaseOxygenLevel(player, 1); return undefined;
      }),
      new SelectOption('Place an ocean').andThen(() => {
        pay(); game.defer(new PlaceOceanTile(player)); return undefined;
      }),
    ];
    if (game.gameOptions.venusNextExtension) {
      options.push(new SelectOption('Raise Venus 1 step').andThen(() => {
        pay(); game.increaseVenusScaleLevel(player, 1); return undefined;
      }));
    }
    return new OrOptions(...options);
  }
}
