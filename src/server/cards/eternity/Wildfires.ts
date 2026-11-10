import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class Wildfires extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.WILDFIRES,
      tags: [Tag.EVENT],
      cost: 9,
      requirements: {greeneries: 2, all: true},
      behavior: {
        global: {temperature: 1},
      },
      metadata: {
        cardNumber: 'E140',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().plants(1, {all})).minus().oxygen(1).temperature(1);
        }),
        description: 'Requires 2 greeneries in play. ALL players decrease their plant production 1 step. Lower oxygen 1 step. Raise the temperature 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      if (p.production.plants > 0) {
        p.production.add(Resource.PLANTS, -1, {log: true, from: {player}});
      }
    }
    player.game.increaseOxygenLevel(player, -1);
    return undefined;
  }
}
