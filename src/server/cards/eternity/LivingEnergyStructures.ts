import {CardName} from '../../../common/cards/CardName';
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
import {questionmark} from '../render/DynamicVictoryPoints';

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
        victoryPoints: questionmark(),
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 5 energy to raise any global parameter 1 step or place an ocean.', (eb) => eb.energy(5).startAction.temperature(1).slash().oxygen(1).slash().venus(1).slash().oceans(1)).br;
          b.production((pb) => pb.energy(1)).nbsp.vpText('1 VP per 3 energy production.');
        }),
        description: 'Requires 3 building tags. Increase your energy production 1 step.',
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
