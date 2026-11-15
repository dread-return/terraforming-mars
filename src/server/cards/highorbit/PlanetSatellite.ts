import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {InfrastructureCard} from './InfrastructureCard';

/** Moonsat and Venus Sat: 1 M€ per Moon (Venus) tag you play and per tile you place on the Moon (Venus). */
abstract class PlanetSatellite extends InfrastructureCard {
  constructor(base: CardName, copy: number, private readonly tag: Tag, private readonly board: BoardType, cardNumber: string, planet: string) {
    super(base, copy, {
      metadata: {
        cardNumber,
        renderData: CardRenderer.builder((b) => {
          b.effect(`Every time you play a ${planet} tag or place a tile on ${planet === 'Moon' ? 'the Moon' : planet}, gain 1 M€.`, (eb) => {
            eb.tag(tag).slash().text(`${planet} tile`).startEffect.megacredits(1);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((t) => t === this.tag).length;
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
    }
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, _space: Space, boardType: BoardType) {
    if (cardOwner === activePlayer && boardType === this.board) {
      cardOwner.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
  }
}

/** Needs The Moon. */
export class Moonsat extends PlanetSatellite {
  constructor(copy: number = 1) {
    super(CardName.MOONSAT, copy, Tag.MOON, BoardType.MOON, 'INF02', 'Moon');
  }
}

/** Needs Venus Next (tiles on Venus come from Venus Phase 2). */
export class VenusSat extends PlanetSatellite {
  constructor(copy: number = 1) {
    super(CardName.VENUS_SAT, copy, Tag.VENUS, BoardType.VENUS, 'INF06', 'Venus');
  }
}
