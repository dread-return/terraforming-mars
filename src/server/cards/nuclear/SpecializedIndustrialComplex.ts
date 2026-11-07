import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {Resource} from '../../../common/Resource';
import {SpaceType} from '../../../common/boards/SpaceType';
import {RobAntillesTiles} from '../robantilles/RobAntillesTiles';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all} from '../Options';

export class SpecializedIndustrialComplex extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SPECIALIZED_INDUSTRIAL_COMPLEX,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 12,

      metadata: {
        cardNumber: 'N44',
        renderData: CardRenderer.builder((b) => {
          b.effect('When an opponent places a special tile, add a radiation to ANY card. When you place one, add 2 radiation to ANY card.', (eb) => {
            eb.specialTile({all}).colon().resource(CardResource.RADIATION).nbsp.specialTile().colon().startEffect.resource(CardResource.RADIATION, 2).asterix();
          }).br;
          b.steel(1).slash().specialTile({all});
        }),
        description: 'Gain 1 steel for every special tile in play.',
      },
    });
  }

  public static specialTilesInPlay(player: IPlayer): number {
    return player.game.board.spaces.filter((space) => space.spaceType !== SpaceType.COLONY && RobAntillesTiles.isSpecialTile(space)).length;
  }

  public override bespokePlay(player: IPlayer) {
    const count = SpecializedIndustrialComplex.specialTilesInPlay(player);
    if (count > 0) {
      player.stock.add(Resource.STEEL, count, {log: true});
    }
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || !RobAntillesTiles.isSpecialTile(space)) {
      return;
    }
    const count = cardOwner === activePlayer ? 2 : 1;
    cardOwner.game.defer(new AddResourcesToCard(cardOwner, CardResource.RADIATION, {count, log: true}));
  }
}
