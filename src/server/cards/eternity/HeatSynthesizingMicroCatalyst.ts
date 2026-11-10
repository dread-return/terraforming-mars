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
          b.action('Pay 5 heat to distribute 3 microbes among your cards.', (eb) => eb.heat(5).startAction.resource(CardResource.MICROBE, 3).asterix()).br;
          b.or().br;
          b.action('Pay 12 heat to distribute 4 floaters among your cards.', (eb) => eb.heat(12).startAction.resource(CardResource.FLOATER, 4).asterix()).br;
          b.resource(CardResource.MICROBE).asterix().resource(CardResource.FLOATER).asterix();
        }),
        description: 'Requires 8% Venus and 0 \u00b0C. Add 1 microbe to any card and 1 floater to any card. 1 VP per 2 floaters here.',
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
