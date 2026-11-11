import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {Tag} from '../../../common/cards/Tag';

export class MeteorTheft extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.METEOR_THEFT,
      tags: [Tag.SPACE],
      cost: 2,
      behavior: {
        tr: -1,
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E87',
        renderData: CardRenderer.builder((b) => {
          b.minus().tr(1).minus().resource(CardResource.ASTEROID).asterix().br.resource(CardResource.ASTEROID).asterix().cards(1);
        }),
        description: 'Lower your TR 1 step. Remove up to 1 asteroid from ANY card. Add 1 asteroid to ANY card. Draw a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.defer(new RemoveResourcesFromCard(player, CardResource.ASTEROID, 1, {source: 'all', blockable: true}));
    game.defer(new AddResourcesToCard(player, CardResource.ASTEROID, {count: 1}));
    return undefined;
  }
}
