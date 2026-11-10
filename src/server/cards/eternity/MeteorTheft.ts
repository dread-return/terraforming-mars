import {ALL_TAGS} from '../../../common/cards/Tag';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class MeteorTheft extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.METEOR_THEFT,
      tags: [Tag.SPACE, Tag.EVENT],
      cost: 2,
      behavior: {
        tr: -1,
      },
      metadata: {
        cardNumber: 'E87',
        renderData: CardRenderer.builder((b) => {
          b.minus().tr(1).minus().resource(CardResource.ASTEROID).asterix().resource(CardResource.ASTEROID).asterix().cards(1).asterix();
        }),
        description: 'Lower your TR 1 step. Remove up to 1 asteroid from ANY card. Add 1 asteroid to ANY card. Name a tag; reveal cards until you reveal that tag. Take that card and discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.defer(new RemoveResourcesFromCard(player, CardResource.ASTEROID, 1, {source: 'all', blockable: true}));
    game.defer(new AddResourcesToCard(player, CardResource.ASTEROID, {count: 1}));
    player.defer(new OrOptions(...ALL_TAGS.filter((t) => t !== Tag.CLONE && t !== Tag.WILD).map((tag) => new SelectOption(tag).andThen(() => {
      player.drawCard(1, {tag});
      return undefined;
    }))).setTitle('Name a tag'));
    return undefined;
  }
}
