import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {all} from '../Options';
import {SelectCard} from '../../inputs/SelectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {SpaceId} from '../../../common/Types';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';
import * as VP from '../render/DynamicVictoryPoints';

export class StJosephOfCupertinoMissionEpic extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ST_JOSEPH_OF_CUPERTINO_MISSION_EPIC,
      tags: [Tag.CITY, Tag.SPACE, Tag.JOVIAN],
      startingMegaCredits: 36,
      victoryPoints: 'special',
      action: {},

      metadata: {
        cardNumber: 'EP-SJC',
        description: 'You start with 36 M€. *1 VP per city with a temple, +1 VP more if that city has 4+ adjacent tiles.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(36);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Pay 12 M€ (steel may be used): build a temple in a city (1 per city). Draw 2 cards: keep 1, give 1 to the city owner. +1 M€ production.', (eb) => {
              eb.megacredits(12).startAction.city({size: Size.SMALL, all}).asterix().cards(1).production((pb) => pb.megacredits(1));
            });
          });
        }),
        victoryPoints: VP.cities(1, 1),
      },
    });
  }

  public data: {temples: Array<string>} = {temples: []};

  private cities(player: IPlayer): Array<Space> {
    return player.game.board.getCities().filter((s) => !this.data.temples.includes(s.id));
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford({cost: 12, steel: true}) && this.cities(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectSpace('St. Joseph: build a temple in which city?', this.cities(player)).andThen((space) => {
      player.game.defer(new SelectPaymentDeferred(player, 12, {canUseSteel: true, title: 'Pay for the temple'}).andThen(() => {
        this.data.temples.push(space.id);
        player.game.log('${0} built a temple', (b) => b.player(player));
        player.production.add(Resource.MEGACREDITS, 1, {log: true});
        const game = player.game;
        const cards = game.projectDeck.drawN(game, 2);
        const owner = space.player;
        // The neutral player (solo games, Castle Queen Mary) owns cities but is not a player: nobody to give a card to.
        if (owner === undefined || owner === player || owner.color === 'neutral' || cards.length < 2) {
          keep(player, cards, [], LogType.DREW);
          return;
        }
        player.defer(new SelectCard('St. Joseph: keep one card (the other goes to the city owner)', 'Keep', cards).andThen(([kept]) => {
          keep(player, [kept], [], LogType.DREW);
          keep(owner, cards.filter((c) => c !== kept), [], LogType.DREW);
          return undefined;
        }));
      }));
      return undefined;
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    const board = player.game.board;
    let points = 0;
    for (const id of this.data.temples) {
      const space = board.getSpaceOrThrow(id as SpaceId);
      points++;
      if (board.getAdjacentSpaces(space).filter((s) => Board.hasRealTile(s)).length >= 4) {
        points++;
      }
    }
    return points;
  }
}
