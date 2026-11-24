import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceId} from '../../../common/Types';
import {SelectSpace} from '../../inputs/SelectSpace';

export class BeyondHolidays extends CorporationCard {
  constructor() {
    super({
      name: CardName.BEYOND_HOLIDAYS,
      tags: [Tag.BUILDING],
      startingMegaCredits: 36,
      initialActionText: 'Place a city tile',

      firstAction: {
        text: 'Place a city tile',
        city: {},
      },

      metadata: {
        cardNumber: 'EP-BYH',
        description: 'You start with 36 M€. As your first action, place a city tile.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36).city();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you place a tile on Mars, put two 5 M€ tokens on 2 free adjacent areas, if possible. Any player who places a tile there takes the M€.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.megacredits(5).emptyTile('normal', {size: Size.SMALL}).megacredits(5).asterix();
            });
          });
        }),
      },
    });
  }

  public static readonly VALUE = 5;

  /** Spaces holding a 5 M€ token. */
  public data: {tokens?: Array<SpaceId>} = {};

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) {
      return;
    }
    const tokens = this.data.tokens ?? [];
    if (tokens.includes(space.id)) {
      this.data.tokens = tokens.filter((id) => id !== space.id);
      activePlayer.stock.add(Resource.MEGACREDITS, BeyondHolidays.VALUE, {log: true, from: {card: this}});
    }
    if (cardOwner !== activePlayer) {
      return;
    }
    const free = () => cardOwner.game.board.getAdjacentSpaces(space).filter((s) =>
      s.tile === undefined && s.player === undefined && s.spaceType !== SpaceType.COLONY && !(this.data.tokens ?? []).includes(s.id));
    const candidates = free();
    if (candidates.length <= 2) {
      this.addTokens(cardOwner, candidates);
      return;
    }
    const pick = (left: number): SelectSpace => new SelectSpace(`Beyond Holidays: place a 5 M€ token (${left} left)`, free()).andThen((s) => {
      this.addTokens(cardOwner, [s]);
      if (left > 1 && free().length > 0) {
        cardOwner.defer(pick(left - 1));
      }
      return undefined;
    });
    cardOwner.defer(pick(2));
  }

  private addTokens(player: IPlayer, spaces: ReadonlyArray<Space>) {
    if (spaces.length === 0) {
      return;
    }
    this.data.tokens = [...(this.data.tokens ?? []), ...spaces.map((s) => s.id)];
    for (const s of spaces) {
      player.game.log('${0} placed a 5 M€ token on ${1}', (b) => b.player(player).space(s));
    }
  }
}
