import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all, digit} from '../Options';
import {MIN_TEMPERATURE} from '../../../common/constants';

export class AtomicTest extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ATOMIC_TEST,
      tags: [Tag.RADIOACTIVE],
      cost: 19,
      behavior: {
        removeAnyPlants: 3,
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 4},
      },

      metadata: {
        cardNumber: 'N02',
        renderData: CardRenderer.builder((b) => {
          b.heat(1).slash().temperature(1).br;
          b.minus().plants(3, {all}).nbsp.resource(CardResource.RADIATION, {amount: 4, digit}).asterix();
        }),
        description: 'Gain 1 heat for every temperature step reached. Remove 3 plants from a player. Add 4 radiation to ANY card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const steps = (player.game.getTemperature() - MIN_TEMPERATURE) / 2;
    player.stock.add(Resource.HEAT, steps, {log: true});
    return undefined;
  }
}
