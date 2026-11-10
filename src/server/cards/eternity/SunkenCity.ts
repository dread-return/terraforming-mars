import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';
import {TileType} from '../../../common/TileType';

export class SunkenCity extends PreludeCard {
  constructor() {
    super({
      name: CardName.SUNKEN_CITY,
      tags: [Tag.MARS, Tag.CITY],
      metadata: {
        cardNumber: 'EP57',
        renderData: CardRenderer.builder((b) => {
          b.minus().cards(1).oceans(1).oceans(1).city().asterix().br.text('City on one of them: an ocean and a city.', {size: Size.SMALL});
        }),
        description: 'Discard a card. Place 2 connected ocean tiles. Then place a city on top of one of those oceans; it counts as an ocean and a city.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.canAddOcean() && player.game.board.getAvailableSpacesForOcean(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const board = game.board;
    const oceans: Array<Space> = [];
    const city = () => {
      if (oceans.length === 0) {
        return undefined;
      }
      return new SelectSpace('Select one of those oceans for the city', oceans).andThen((space) => {
        game.addTile(player, space, {tileType: TileType.OCEAN_CITY, card: this.name});
        return undefined;
      });
    };
    const firstOceans = () => {
      const all = board.getAvailableSpacesForOcean(player);
      const paired = all.filter((s) => board.getAdjacentSpaces(s).some((a) => all.includes(a)));
      return paired.length > 0 ? paired : all;
    };
    const place = () => new SelectSpace('Select space for the first ocean', firstOceans()).andThen((o1) => {
      game.addOcean(player, o1);
      oceans.push(o1);
      const next = board.getAvailableSpacesForOcean(player).filter((s) => board.getAdjacentSpaces(o1).includes(s));
      if (next.length === 0 || !game.canAddOcean()) {
        return city();
      }
      return new SelectSpace('Select space for the second ocean (connected to the first)', next).andThen((o2) => {
        game.addOcean(player, o2);
        oceans.push(o2);
        return city();
      });
    });
    if (player.cardsInHand.length === 0) {
      player.defer(place());
      return undefined;
    }
    player.defer(new SelectCard('Discard a card', 'Discard', player.cardsInHand).andThen(([card]) => {
      player.discardCardFromHand(card, {log: true});
      return place();
    }));
    return undefined;
  }
}
