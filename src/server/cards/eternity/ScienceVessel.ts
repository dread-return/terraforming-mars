import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class ScienceVessel extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SCIENCE_VESSEL,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 19,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E114',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.energy(1).startAction.resource(CardResource.FLOATER).asterix().cards(1)).br;
          b.action(undefined, (eb) => eb.steel(1).startAction.resource(CardResource.DATA).asterix().titanium(1)).br;
          b.action('Do one: * = to any card.', (eb) => eb.titanium(1).startAction.resource(CardResource.SCIENCE).asterix().megacredits(1)).br;
          b.temperature(1).slash().oxygen(1).slash().oceans(1).asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.energy > 0 || player.steel > 0 || player.titanium > 0;
  }
  public action(player: IPlayer) {
    const game = player.game;
    const opts = [];
    if (player.energy > 0) {
      opts.push(new SelectOption('Spend 1 energy: add 1 floater to any card and draw a card').andThen(() => {
        player.stock.deduct(Resource.ENERGY, 1);
        game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 1}));
        player.drawCard();
        return undefined;
      }));
    }
    if (player.steel > 0) {
      opts.push(new SelectOption('Spend 1 steel: add 1 data to any card and gain 1 titanium').andThen(() => {
        player.stock.deduct(Resource.STEEL, 1);
        game.defer(new AddResourcesToCard(player, CardResource.DATA, {count: 1}));
        player.stock.add(Resource.TITANIUM, 1, {log: true});
        return undefined;
      }));
    }
    if (player.titanium > 0) {
      opts.push(new SelectOption('Spend 1 titanium: add 1 science resource to any card and gain 1 M€').andThen(() => {
        player.stock.deduct(Resource.TITANIUM, 1);
        game.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: 1}));
        player.stock.add(Resource.MEGACREDITS, 1, {log: true});
        return undefined;
      }));
    }
    return opts.length === 1 ? opts[0] : new OrOptions(...opts);
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const opts = [
      new SelectOption('Raise the temperature 1 step').andThen(() => {
        game.increaseTemperature(player, 1); return undefined;
      }),
      new SelectOption('Raise oxygen 1 step').andThen(() => {
        game.increaseOxygenLevel(player, 1); return undefined;
      }),
      new SelectOption('Place an ocean').andThen(() => {
        game.defer(new PlaceOceanTile(player)); return undefined;
      }),
    ];
    if (game.gameOptions.venusNextExtension) {
      opts.push(new SelectOption('Raise Venus 1 step').andThen(() => {
        game.increaseVenusScaleLevel(player, 1); return undefined;
      }));
    }
    return new OrOptions(...opts).setTitle('Raise a global parameter or place an ocean');
  }
}
