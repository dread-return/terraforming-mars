import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class SingularitySuit extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SINGULARITY_SUIT,
      tags: [Tag.SPACE],
      cost: 11,
      resourceType: CardResource.SINGULARITY,
      requirements: [{tag: Tag.SPACE}, {tag: Tag.SCIENCE}],
      victoryPoints: {resourcesHere: {}, each: -1},
      metadata: {
        cardNumber: 'E117',
        renderData: CardRenderer.builder((b) => {
          b.text('Gen 2-4:').production((pb) => pb.megacredits(2)).resource(CardResource.SINGULARITY).br;
          b.text('Gen 5-7:').cards(2).resource(CardResource.SINGULARITY).br;
          b.text('Gen 8-10:').tr(1).resource(CardResource.SINGULARITY).br;
          b.text('Gen 11+:').minus().resource(CardResource.SINGULARITY, 2).asterix().br;
          b.text('(Action: do the effect for the current generation.)', {size: Size.SMALL});
        }),
        description: 'Requires a space tag and a science tag. -1 VP per singularity here (effects that ignore negative VP do not affect this card).',
      },
    });
  }

  public canAct(player: IPlayer) {
    if (player.game.generation < 2) {
      return false;
    }
    if (player.game.generation >= 11) {
      return player.getResourceCards(CardResource.SINGULARITY).some((c) => c.resourceCount > 0);
    }
    return true;
  }
  public action(player: IPlayer) {
    const gen = player.game.generation;
    if (gen >= 11) {
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.SINGULARITY, 1, {source: 'self'}));
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.SINGULARITY, 1, {source: 'self'}));
      return undefined;
    }
    if (gen <= 4) {
      player.production.add(Resource.MEGACREDITS, 2, {log: true});
    } else if (gen <= 7) {
      player.drawCard(2);
    } else {
      player.increaseTerraformRating(1);
    }
    player.addResourceTo(this, {qty: 1, log: true});
    return undefined;
  }
}
