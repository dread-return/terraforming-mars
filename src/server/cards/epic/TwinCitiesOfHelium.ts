import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {SpaceId} from '../../../common/Types';

export class TwinCitiesOfHelium extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TWIN_CITIES_OF_HELIUM,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 30,
      initialActionText: 'Place a city next to an ocean-reserved space',

      metadata: {
        cardNumber: 'EP-TCH',
        description: 'You start with 30 M€. First action: city next to an ocean space.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).city({size: Size.SMALL}).asterix();
          b.br;
          b.tag(Tag.EARTH, {cancelled: true}).nbsp.text('No Earth tags, ever', {size: Size.SMALL});
          b.corpBox('effect', (ce) => {
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.SCIENCE).slash().vpIcon('+').startEffect.megacredits(-3);
            });
            ce.effect('Science & VP cards -3 M€. Ocean by that city: +1 plant prod, +2 M€.', (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).asterix().startEffect.production((pb) => pb.plants(1)).megacredits(2);
            });
          });
        }),
      },
    });
  }

  public data: {spaceId?: string} = {};

  public override initialAction(player: IPlayer) {
    const board = player.game.board;
    const spaces = board.getAvailableSpacesOnLand(player).filter((s) =>
      board.getAdjacentSpaces(s).some((adj) => adj.spaceType === SpaceType.OCEAN));
    player.game.defer(new PlaceCityTile(player, {spaces, title: 'Twin Cities of Helium: place a city next to an ocean space'})
      .andThen((space) => {
        if (space !== undefined) {
          this.data.spaceId = space.id;
        }
      }));
    return undefined;
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    if (card.tags.includes(Tag.SCIENCE)) {
      return 3;
    }
    const vp = card.victoryPoints;
    if (vp === undefined || vp === 'special') {
      return 0;
    }
    return typeof vp === 'number' ? (vp > 0 ? 3 : 0) : 3;
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (this.data.spaceId === undefined || !Board.isUncoveredOceanSpace(space)) {
      return;
    }
    const city = cardOwner.game.board.getSpaceOrThrow(this.data.spaceId as SpaceId);
    if (cardOwner.game.board.getAdjacentSpaces(space).includes(city)) {
      cardOwner.production.add(Resource.PLANTS, 1, {log: true, from: {card: this}});
      cardOwner.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
    }
  }
}
