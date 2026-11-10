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

export class TiceEcologicalLab extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TICE_ECOLOGICAL_LAB,
      tags: [Tag.PLANT, Tag.ANIMAL, Tag.MICROBE],
      cost: 4,
      metadata: {
        cardNumber: 'E35',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(5).colon().production((pb) => pb.plants(1)).br;
          b.megacredits(3).colon().resource(CardResource.MICROBE, 2).asterix().br;
          b.megacredits(3).colon().resource(CardResource.ANIMAL).asterix();
        }),
        description: 'You may do each: pay 5 M\u20ac to increase your plant production 1 step; pay 3 M\u20ac to add 2 microbes to any card; pay 3 M\u20ac to add 1 animal to any card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const steps: Array<[number, string, () => void]> = [
      [5, 'Pay 5 M€ to increase your plant production 1 step', () => player.production.add(Resource.PLANTS, 1, {log: true})],
      [3, 'Pay 3 M€ to add 2 microbes to any card', () => player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: 2}))],
      [3, 'Pay 3 M€ to add 1 animal to any card', () => player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: 1}))],
    ];
    const ask = (i: number): void => {
      if (i >= steps.length) {
        return;
      }
      const [cost, title, fn] = steps[i];
      if (!player.canAfford(cost)) {
        return ask(i + 1);
      }
      player.defer(new OrOptions(
        new SelectOption(title).andThen(() => {
          player.stock.deduct(Resource.MEGACREDITS, cost);
          fn();
          ask(i + 1);
          return undefined;
        }),
        new SelectOption('Skip').andThen(() => {
          ask(i + 1);
          return undefined;
        })));
    };
    ask(0);
    return undefined;
  }
}
