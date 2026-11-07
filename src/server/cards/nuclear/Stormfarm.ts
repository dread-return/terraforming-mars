import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class Stormfarm extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STORMFARM,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 10,
      victoryPoints: 1,
      behavior: {
        or: {
          behaviors: [
            {title: 'Increase your energy production 1 step', production: {energy: 1}},
            {title: 'Increase your heat production 1 step', production: {heat: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N21',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).or().production((pb) => pb.heat(1)).br;
          b.energy(5).arrow().heat(5).or().heat(5).arrow().energy(5);
        }),
        description: 'Increase your energy OR heat production 1 step. Convert either 5 energy to 5 heat OR 5 heat to 5 energy.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => {
      const options = new OrOptions();
      if (player.energy >= 5) {
        options.options.push(new SelectOption('Convert 5 energy to 5 heat').andThen(() => {
          player.stock.deduct(Resource.ENERGY, 5);
          player.stock.add(Resource.HEAT, 5, {log: true});
          return undefined;
        }));
      }
      if (player.heat >= 5) {
        options.options.push(new SelectOption('Convert 5 heat to 5 energy').andThen(() => {
          player.stock.deduct(Resource.HEAT, 5);
          player.stock.add(Resource.ENERGY, 5, {log: true});
          return undefined;
        }));
      }
      if (options.options.length === 0) {
        return undefined;
      }
      options.options.push(new SelectOption('Do not convert'));
      return options;
    });
    return undefined;
  }
}
