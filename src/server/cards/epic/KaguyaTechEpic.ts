import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SelectCard} from '../../inputs/SelectCard';
import {TileType} from '../../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';

export class KaguyaTechEpic extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.KAGUYA_TECH_EPIC,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 40,

      behavior: {
        production: {energy: 1, plants: 1},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-KGT',
        description: 'You start with 40 M€, 1 energy production and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).production((pb) => pb.energy(1).plants(1));
          b.br;
          b.action(undefined, (eb) => {
            eb.cards(1, {secondaryTag: Tag.CITY, cancelled: true}).slash().tag(Tag.SCIENCE).startAction
              .greenery({withO2: false}).text('→').city();
          }).br;
          b.text('and', {size: Size.MEDIUM, uppercase: true}).production((pb) => pb.megacredits(2)).cards(1).br;
          b.plainText('(Action: discard a card with a city or science tag from your hand, then turn one of your greeneries into a city, ignoring placement rules (not a tile placement). Gain 2 M€ production and draw a card.)');
        }),
      },
    });
  }

  private static discardable(player: IPlayer): Array<IProjectCard> {
    return player.cardsInHand.filter((card) => card.tags.includes(Tag.CITY) || card.tags.includes(Tag.SCIENCE));
  }

  private static greeneries(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      space.tile?.tileType === TileType.GREENERY && space.player === player && space.spaceType !== SpaceType.COLONY);
  }

  public override bespokeCanAct(player: IPlayer) {
    return KaguyaTechEpic.discardable(player).length > 0 && KaguyaTechEpic.greeneries(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Kaguya Tech: discard a card with a city or science tag', 'Discard', KaguyaTechEpic.discardable(player))
      .andThen(([card]) => {
        player.discardCardFromHand(card, {log: true});
        player.defer(new SelectSpace('Kaguya Tech: select a greenery to turn into a city', KaguyaTechEpic.greeneries(player)).andThen((space) => {
          // Swap the tile in place: not a tile placement, so no bonuses or placement effects.
          space.tile = {tileType: TileType.CITY};
          player.game.log('${0} turned the greenery on ${1} into a city', (b) => b.player(player).space(space));
          player.production.add(Resource.MEGACREDITS, 2, {log: true});
          player.drawCard();
          return undefined;
        }));
        return undefined;
      });
  }
}
