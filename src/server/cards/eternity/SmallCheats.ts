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

export class SmallCheats extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SMALL_CHEATS,
      tags: [],
      cost: 3,
      resourceType: CardResource.CHEAT,
      victoryPoints: {resourcesHere: {}, per: 3, each: -1},
      metadata: {
        cardNumber: 'E118',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.CHEAT, 4).colon().production((pb) => pb.wild(1)).br;
          b.resource(CardResource.CHEAT, 3).colon().megacredits(8).br;
          b.resource(CardResource.CHEAT, 2).colon().cards(1);
        }),
        description: 'You may do each: add 4 cheat counters here to increase any production 1 step; add 3 to gain 8 M\u20ac; add 2 to draw a card. -1 VP per 3 cheat counters here.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const prod = () => new OrOptions(...[Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT].map((r) => new SelectOption(r).andThen(() => {
      player.production.add(r, 1, {log: true});
      return undefined;
    }))).setTitle('Increase a production 1 step');
    const steps: Array<[string, number, () => void]> = [
      ['Add 4 cheat counters to increase any production 1 step', 4, () => player.defer(prod())],
      ['Add 3 cheat counters to gain 8 M€', 3, () => player.stock.add(Resource.MEGACREDITS, 8, {log: true})],
      ['Add 2 cheat counters to draw a card', 2, () => player.drawCard(1)],
    ];
    const ask = (i: number): void => {
      if (i >= steps.length) {
        return;
      }
      const [title, n, fn] = steps[i];
      player.defer(new OrOptions(
        new SelectOption(title).andThen(() => {
          player.addResourceTo(this, {qty: n, log: true});
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
