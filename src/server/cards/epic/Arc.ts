import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {SpaceId} from '../../../common/Types';
import {digit} from '../Options';
import {SelectSpace} from '../../inputs/SelectSpace';

export class Arc extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.ARC,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 32,
      resourceType: CardResource.ANIMAL,

      behavior: {
        addResources: 2,
      },

      action: {},

      metadata: {
        cardNumber: 'EP-ARC',
        description: 'You start with 32 M€ and 2 animals here.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).resource(CardResource.ANIMAL, {amount: 2, digit});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Move 1 of your animals onto a greenery or ocean (one per tile), or add 2 animals here.', (eb) => {
              eb.resource(CardResource.ANIMAL).startAction.emptyTile('normal', {size: Size.SMALL}).asterix().slash().resource(CardResource.ANIMAL, {amount: 2, digit});
            });
            ce.effect('Spend animals here any time: each is 1 M€ per greenery with an animal, or 1 plant per 2 oceans with one.', (eb) => {
              eb.resource(CardResource.ANIMAL).startEffect.megacredits(1).slash().greenery({size: Size.SMALL, withO2: false}).asterix().text('or', {size: Size.SMALL}).plants(1).slash().text('2').oceans(1, {size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  /** Greeneries and oceans with one of this player's animals on them. */
  public data: {tiles?: Array<SpaceId>} = {};

  private static populatable(player: IPlayer, taken: ReadonlyArray<SpaceId>): Array<Space> {
    return player.game.board.spaces.filter((space) => space.spaceType !== SpaceType.COLONY && space.tile !== undefined &&
      !taken.includes(space.id) && (Board.isGreenerySpace(space) || Board.isOceanSpace(space)));
  }

  private sources(player: IPlayer): Array<ICard> {
    return player.getCardsWithResources(CardResource.ANIMAL);
  }

  /** Populated greeneries and oceans (still on the board). */
  public populated(player: IPlayer): {greeneries: number, oceans: number} {
    const board = player.game.board;
    const spaces = (this.data.tiles ?? []).map((id) => board.getSpaceOrThrow(id)).filter((s) => s.tile !== undefined);
    return {
      greeneries: spaces.filter((s) => Board.isGreenerySpace(s)).length,
      oceans: spaces.filter((s) => Board.isOceanSpace(s) && !Board.isGreenerySpace(s)).length,
    };
  }

  public override bespokeCanAct() {
    return true;
  }

  public override bespokeAction(player: IPlayer) {
    const add = new SelectOption('Add 2 animals here', 'Add').andThen(() => {
      player.addResourceTo(this, {qty: 2, log: true});
      return undefined;
    });
    const spaces = Arc.populatable(player, this.data.tiles ?? []);
    const sources = this.sources(player);
    if (spaces.length === 0 || sources.length === 0) {
      return add;
    }
    const move = new SelectOption('Move 1 of your animals onto a greenery or ocean', 'Move').andThen(() =>
      new SelectCard('Select the card to take the animal from', 'Take', sources).andThen(([card]) =>
        new SelectSpace('Select a greenery or ocean for the animal', spaces).andThen((space) => {
          player.removeResourceFrom(card, 1);
          this.data.tiles = [...(this.data.tiles ?? []), space.id];
          player.game.log('${0} moved an animal from ${1} onto ${2}', (b) => b.player(player).card(card).space(space));
          return undefined;
        })));
    return new OrOptions(move, add);
  }
}
