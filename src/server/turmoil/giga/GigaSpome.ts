import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Resource} from '../../../common/Resource';
import {TileType} from '../../../common/TileType';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {MoonExpansion} from '../../moon/MoonExpansion';
import {BuildColony} from '../../deferredActions/BuildColony';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';
import {logPartyAction, MegacreditBonus, tilesNextToCities} from './GigaHelpers';

const from = {partyName: PartyName.SPOME};

/** Lunar habitats and Venus habitats (the "cloud cities") that `player` owns. */
function habitats(player: IPlayer): number {
  const game = player.game;
  const moon = MoonExpansion.spaces(game, TileType.MOON_HABITAT, {ownedBy: player}).length;
  const venus = (game.board.venusMap?.spaces ?? []).filter((space) => space.tile?.tileType === TileType.VENUS_HABITAT && Board.spaceOwnedBy(space, player)).length;
  return moon + venus;
}

// TODO(Leo): the "1 M€ for every level in the city track" half needs the individual city track, which does not exist yet.
const BONUS_A = new MegacreditBonus('Ob01', PartyName.SPOME,
  'Gain 1 M€ for every lunar habitat and cloud city (Venus habitat) you have (city track levels are not in the game yet)',
  habitats);

const BONUS_B = new MegacreditBonus('Ob02', PartyName.SPOME,
  'Gain 1 M€ for every tile you own next to a city and every colony you have',
  (player) => tilesNextToCities(player) + player.getColoniesCount());

const POLICY_1: IPolicy = {
  id: 'Op01',
  description: 'Draw a card every time you place a city tile',
  onTilePlaced(player: IPlayer, space: Space) {
    if (Board.isCitySpace(space)) {
      player.drawCard();
    }
  },
};

const POLICY_2: IPolicy = {
  id: 'Op02',
  description: 'Gain 4 M€ every time you place a lunar habitat or cloud city (Venus habitat) tile',
  onTilePlaced(player: IPlayer, space: Space) {
    const type = space.tile?.tileType;
    if (type === TileType.MOON_HABITAT || type === TileType.VENUS_HABITAT) {
      player.stock.add(Resource.MEGACREDITS, 4, {log: true, from});
    }
  },
};

const POLICY_3: IPolicy = {
  id: 'Op03',
  description: 'Action: pay 15 M€ (titanium can be used) to place a colony (Colonies). Repeatable',
  canAct(player: IPlayer) {
    return player.game.gameOptions.coloniesExtension &&
      player.canAfford({cost: 15, titanium: true}) &&
      player.colonies.getPlayableColonies().length > 0;
  },
  action(player: IPlayer) {
    logPartyAction(player, PartyName.SPOME);
    const game = player.game;
    game.defer(new SelectPaymentDeferred(player, 15, {canUseTitanium: true, title: TITLES.payForPartyAction(PartyName.SPOME)}))
      .andThen(() => game.defer(new BuildColony(player)));
    return undefined;
  },
};

// TODO(Leo): Spome policy 4 ("pay 5 M€ to place a town tile on Mars and advance the individual city track, worth 1 VP")
// needs town tiles and the individual city track. Spome has policies 1 to 3 until then.

export class GigaSpome extends Party implements IParty {
  readonly name = PartyName.SPOME;
  readonly bonuses = [BONUS_A, BONUS_B];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3];
}
