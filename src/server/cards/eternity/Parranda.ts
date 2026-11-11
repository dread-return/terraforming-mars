import {ActionCard} from '../ActionCard';
import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class Parranda extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PARRANDA,
      tags: [Tag.MARS, Tag.CITY],
      cost: 29,
      requirements: {cities: 1, all: true},
      victoryPoints: 2,
      action: {
        drawCard: 1,
        stock: {heat: 2},
      },
      metadata: {
        cardNumber: 'E98',
        renderData: CardRenderer.builder((b) => {
          b.effect('After producing resources, you must pay M€ equal to the current generation or discard this card.', (eb) => {
            eb.text('PROD').startEffect.megacredits(0, {text: '-X'}).text('/GEN, OR DISCARD', {size: Size.SMALL});
          }).br;
          b.action('Draw a card and gain 2 heat.', (eb) => eb.empty().startAction.cards(1).heat(2)).br;
          b.city().asterix();
        }),
        description: 'Requires that a city tile is in play. Place a city tile next to at least one other city, ignoring normal placement restrictions.',
      },
    });
  }

  /** Free land next to at least one city, ignoring the normal no-city-next-to-a-city rule. */
  private spaces(player: IPlayer) {
    const board = player.game.board;
    return board.getAvailableSpacesOnLand(player).filter((s) => board.getAdjacentSpaces(s).some((a) => Board.isCitySpace(a)));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select space next to a city for your city', this.spaces(player)).andThen((space) => {
      player.game.addCity(player, space);
      return undefined;
    }));
    return undefined;
  }
  public onProductionPhase(player: IPlayer) {
    const gen = player.game.generation;
    if (player.megaCredits >= gen) {
      player.stock.deduct(Resource.MEGACREDITS, gen, {log: true});
    } else {
      player.discardPlayedCard(this);
      player.game.log('${0} could not pay for ${1} and discarded it', (b) => b.player(player).card(this));
    }
    return undefined;
  }
}
