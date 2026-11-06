import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class PleistoceneMegafauna extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PLEISTOCENE_MEGAFAUNA,
      tags: [Tag.ANIMAL],
      cost: 12,
      requirements: {tag: Tag.SCIENCE, count: 5},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      behavior: {
        production: {plants: -1},
      },

      action: {
        addResources: 1,
      },

      metadata: {
        cardNumber: 'I64',
        renderData: CardRenderer.builder((b) => {
          b.action('Add an animal to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.ANIMAL);
          }).br;
          b.production((pb) => pb.minus().plants(1, {all}).nbsp.minus().plants(1));
        }),
        description: 'Requires 5 science tags. -1 plant production for you and one opponent.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const targets = player.opponents.filter((opponent) => opponent.production.plants > 0);
    if (targets.length === 0) {
      return undefined;
    }
    const decrease = (target: IPlayer) => {
      target.production.add(Resource.PLANTS, -1, {log: true, from: {player}});
      return undefined;
    };
    if (targets.length === 1) {
      return decrease(targets[0]);
    }
    return new SelectPlayer(targets, 'Select an opponent to decrease their plant production 1 step', 'Decrease')
      .andThen(decrease);
  }
}
