import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class MutatedTrees extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MUTATED_TREES,
      tags: [Tag.PLANT],
      cost: 15,
      requirements: {oxygen: 6},
      behavior: {global: {oxygen: 1}},

      metadata: {
        cardNumber: 'N04',
        renderData: CardRenderer.builder((b) => {
          b.oxygen(1).br;
          b.production((pb) => pb.plants(1)).slash().cards(1, {secondaryTag: Tag.MICROBE}).slash().cards(1, {secondaryTag: Tag.ANIMAL}).asterix();
        }),
        description: 'Requires 6% oxygen. Raise oxygen 1 step. Increase your plant production 1 step for every card you own holding at least 1 microbe or 1 animal.',
      },
    });
  }

  public static count(player: IPlayer): number {
    return player.getCardsWithResources().filter((card) =>
      card.resourceType === CardResource.MICROBE || card.resourceType === CardResource.ANIMAL).length;
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.PLANTS, MutatedTrees.count(player), {log: true});
    return undefined;
  }
}
