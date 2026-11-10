import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {BoardType} from '../../boards/BoardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class JellyfishFarms extends PreludeCard {
  constructor() {
    super({
      name: CardName.JELLYFISH_FARMS,
      tags: [Tag.ANIMAL],
      behavior: {
        production: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'EP28',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(3)).oceans(1).asterix().br.text('Anyone placing a tile next to it may add an animal to a card.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Increase your M\u20ac production 3 steps. Place an ocean tile and put a marker on it. Anyone placing a tile adjacent to this ocean may add an animal to a card.',
      },
    });
  }

  public data: {space?: string} = {};
  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForOcean(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select space for the Jellyfish Farms ocean', player.game.board.getAvailableSpacesForOcean(player)).andThen((space) => {
      player.game.addOcean(player, space);
      this.data = {space: space.id};
      player.game.log('${0} marked the ocean at ${1} for Jellyfish Farms', (b) => b.player(player).space(space));
      return undefined;
    }));
    return undefined;
  }
  public onTilePlaced(_cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || this.data.space === undefined || space.id === this.data.space) {
      return;
    }
    const marked = activePlayer.game.board.getSpaceOrThrow(this.data.space as Space['id']);
    if (activePlayer.game.board.getAdjacentSpaces(marked).includes(space)) {
      activePlayer.game.defer(new AddResourcesToCard(activePlayer, CardResource.ANIMAL, {count: 1}));
    }
  }
}
