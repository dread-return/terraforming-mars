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
import {digit} from '../Options';

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
          b.text('Gen 2-4:', {size: Size.SMALL}).production((pb) => pb.megacredits(2)).nbsp.text('5-7:', {size: Size.SMALL}).cards(2, {digit}).br;
          b.text('8-10:', {size: Size.SMALL}).tr(1).nbsp.text('11+:', {size: Size.SMALL}).minus().resource(CardResource.SINGULARITY, {amount: 2, digit}).asterix().br;
          b.text('Action: this generation’s effect (gens 2-10: +1 singularity here).', {size: Size.SMALL, isBold: false});
        }),
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
