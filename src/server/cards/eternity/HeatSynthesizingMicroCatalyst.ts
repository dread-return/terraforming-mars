import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class HeatSynthesizingMicroCatalyst extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HEAT_SYNTHESIZING_MICRO_CATALYST,
      tags: [Tag.MICROBE, Tag.VENUS],
      cost: 6,
      resourceType: CardResource.FLOATER,
      requirements: [{venus: 8}, {temperature: 0}],
      victoryPoints: {resourcesHere: {}, per: 2},
      behavior: {
        addResourcesToAnyCard: [{count: 1, type: CardResource.MICROBE}, {count: 1, type: CardResource.FLOATER}],
      },
      metadata: {
        cardNumber: 'E75',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.heat(5, {digit}).startAction.resource(CardResource.MICROBE, {amount: 3, digit}).asterix()).br;
          b.or().br;
          b.action('Spend 5 heat for 3 microbes OR 12 heat for 4 floaters, spread over your cards.', (eb) => eb.heat(12, {digit}).startAction.resource(CardResource.FLOATER, {amount: 4, digit}).asterix()).br;
          b.resource(CardResource.MICROBE).asterix().resource(CardResource.FLOATER).asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.heat >= 5;
  }
  public action(player: IPlayer) {
    const give = (type: CardResource, n: number) => {
      for (let i = 0; i < n; i++) {
        player.game.defer(new AddResourcesToCard(player, type, {count: 1}));
      }
    };
    const microbes = new SelectOption('Pay 5 heat to distribute 3 microbes').andThen(() => {
      player.stock.deduct(Resource.HEAT, 5);
      give(CardResource.MICROBE, 3);
      return undefined;
    });
    if (player.heat < 12) {
      return microbes;
    }
    return new OrOptions(microbes, new SelectOption('Pay 12 heat to distribute 4 floaters').andThen(() => {
      player.stock.deduct(Resource.HEAT, 12);
      give(CardResource.FLOATER, 4);
      return undefined;
    }));
  }
}
