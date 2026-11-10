import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {Units} from '../../../common/Units';

export class SteelFrictionProducers extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STEEL_FRICTION_PRODUCERS,
      tags: [Tag.MARS, Tag.BUILDING],
      cost: 3,
      metadata: {
        cardNumber: 'E123',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(6).colon().production((pb) => pb.steel(2)).br;
          b.megacredits(7).colon().production((pb) => pb.energy(1).heat(1)).br;
          b.megacredits(5).colon().tr(1);
        }),
        description: 'You may do each: pay 6 M\u20ac for +2 steel production; 7 M\u20ac for +1 energy and heat production; 5 M\u20ac for +1 TR.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const steps: Array<[number, string, () => void]> = [
      [6, 'Pay 6 M€ to increase your steel production 2 steps', () => player.production.add(Resource.STEEL, 2, {log: true})],
      [7, 'Pay 7 M€ to increase your energy and heat production 1 step', () => player.production.adjust(Units.of({energy: 1, heat: 1}), {log: true})],
      [5, 'Pay 5 M€ to raise your TR 1 step', () => player.increaseTerraformRating(1)],
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
