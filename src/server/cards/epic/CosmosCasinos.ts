import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class CosmosCasinos extends CorporationCard {
  constructor() {
    super({
      name: CardName.COSMOS_CASINOS,
      tags: [],
      startingMegaCredits: 52,
      initialActionText: 'Fund an award for free (it scores double)',

      metadata: {
        cardNumber: 'EP-CSM',
        description: 'You start with 52 M€. First action: fund an award for free; it scores double.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(52).award().asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.city({size: Size.SMALL}).asterix().startEffect.production((pb) => pb.megacredits(1)).slash().city({size: Size.SMALL});
            });
            ce.vSpace(Size.TINY);
            ce.effect('Your cities may go next to cities: +1 M€ prod. per adjacent city; opponents lose 1 per adjacent city of theirs.', (eb) => {
              eb.empty().startEffect.production((pb) => pb.megacredits(-1, {all})).slash().city({size: Size.SMALL, all});
            });
          });
        }),
      },
    });
  }

  public data: {award?: string} = {};

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const open = game.awards.filter((a) => !game.hasBeenFunded(a));
    if (open.length === 0 || game.allAwardsFunded()) {
      return undefined;
    }
    return new OrOptions(...open.map((award) => new SelectOption(`Fund ${award.name} for free (double points)`, 'Fund').andThen(() => {
      this.data.award = award.name;
      game.fundAward(player, award);
      return undefined;
    }))).setTitle('Cosmos Casinos: fund an award for free');
  }

  /** Your city on Mars: +1 M€ production per adjacent city; opponents lose 1 per adjacent city of theirs. */
  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || !Board.isCitySpace(space) || space.spaceType === SpaceType.COLONY) {
      return;
    }
    const cities = cardOwner.game.board.getAdjacentSpaces(space).filter(Board.isCitySpace);
    if (cities.length === 0) {
      return;
    }
    cardOwner.production.add(Resource.MEGACREDITS, cities.length, {log: true});
    for (const opponent of cardOwner.opponents) {
      const theirs = cities.filter((c) => c.player?.id === opponent.id).length;
      if (theirs > 0) {
        opponent.production.add(Resource.MEGACREDITS, -Math.min(theirs, opponent.production.megacredits + 5), {log: true, from: {player: cardOwner}});
      }
    }
  }
}
