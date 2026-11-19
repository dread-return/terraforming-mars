import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';

export class HermeticOrderOfMarsEpic extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HERMETIC_ORDER_OF_MARS_EPIC,
      tags: [Tag.EARTH, Tag.MARS],
      startingMegaCredits: 30,

      behavior: {
        stock: {plants: 2, steel: 2},
      },

      metadata: {
        cardNumber: 'EP-HOM',
        description: 'You start with 30 M€, 2 plants and 2 steel.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(30).plants(2).steel(2);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.megacredits(1).slash().emptyTile('normal', {size: Size.SMALL}).asterix();
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Your tile: 1 M€ per empty adjacent space. Any tile placed next to no other tile: +1 M€ production.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL, all}).asterix().startEffect.production((pb) => pb.megacredits(1));
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) {
      return;
    }
    const adjacent = cardOwner.game.board.getAdjacentSpaces(space);
    if (cardOwner === activePlayer) {
      const empty = adjacent.filter((s) => !Board.hasRealTile(s) && s.spaceType !== SpaceType.RESTRICTED).length;
      if (empty > 0) {
        cardOwner.stock.add(Resource.MEGACREDITS, empty, {log: true, from: {card: this}});
      }
    }
    if (!adjacent.some((s) => Board.hasRealTile(s))) {
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
  }
}
