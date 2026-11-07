import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {StealResources} from '../../deferredActions/StealResources';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all} from '../Options';

export class RefugeesRoundup extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.REFUGEES_ROUNDUP,
      tags: [Tag.RADIOACTIVE],
      cost: 2,
      requirements: {cities: 1, all},

      metadata: {
        cardNumber: 'N63',
        renderData: CardRenderer.builder((b) => {
          b.text('steal').titanium(1, {all}).slash().steel(1, {all}).nbsp.minus().resource(CardResource.RADIATION, {all});
        }),
        description: 'Requires a city in play. Steal 1 titanium OR 1 steel from any player. Remove a radiation from any player.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const titanium = StealResources.getCandidates(player, Resource.TITANIUM, 1).length > 0;
    const steel = StealResources.getCandidates(player, Resource.STEEL, 1).length > 0;
    if (titanium && steel) {
      player.defer(new OrOptions(
        new SelectOption('Steal 1 titanium').andThen(() => {
          player.game.defer(new StealResources(player, Resource.TITANIUM, 1));
          return undefined;
        }),
        new SelectOption('Steal 1 steel').andThen(() => {
          player.game.defer(new StealResources(player, Resource.STEEL, 1));
          return undefined;
        }),
      ));
    } else if (titanium || steel) {
      player.game.defer(new StealResources(player, titanium ? Resource.TITANIUM : Resource.STEEL, 1));
    }
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.RADIATION, 1, {mandatory: false}));
    return undefined;
  }
}
