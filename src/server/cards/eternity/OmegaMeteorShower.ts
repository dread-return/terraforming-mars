import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class OmegaMeteorShower extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.OMEGA_METEOR_SHOWER,
      tags: [Tag.SPACE],
      cost: 27,
      behavior: {
        global: {temperature: 2, oxygen: 1},
      },
      metadata: {
        cardNumber: 'E95',
        renderData: CardRenderer.builder((b) => {
          b.temperature(2).oxygen(1).br.titanium(1, {all}).minus().plants(6, {all});
        }),
        description: 'Raise the temperature 2 steps and oxygen 1 step. ALL players gain 1 titanium and lose 6 plants.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      p.stock.add(Resource.TITANIUM, 1, {log: true});
      if (p === player || !p.plantsAreProtected()) {
        p.stock.deduct(Resource.PLANTS, Math.min(6, p.plants), {log: true, from: {player}});
      }
    }
    return undefined;
  }
}
