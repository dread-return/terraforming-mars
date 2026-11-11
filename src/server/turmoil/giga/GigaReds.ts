import {IParty} from '../parties/IParty';
import {Party} from '../parties/Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {Resource} from '../../../common/Resource';
import {IBonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {IGame} from '../../IGame';
import {Space} from '../../boards/Space';
import {DiscardCards} from '../../deferredActions/DiscardCards';
import {isOnMars, tilesOnMars} from './GigaHelpers';

const from = {partyName: PartyName.REDS};

class RedsBonusA implements IBonus {
  readonly id = 'Rb01' as const;
  readonly description = 'The player(s) with the lowest TR gain 1 TR';

  getScore(player: IPlayer): number {
    return player.terraformRating;
  }

  grant(game: IGame) {
    if (game.isSoloMode()) {
      return;
    }
    // MarsBot's TR counts towards the lowest, but MarsBot never gains TR.
    const min = Math.min(...game.playersPlusMarsBot.map((p) => p.terraformRating));
    for (const player of game.players) {
      if (player.terraformRating === min) {
        player.increaseTerraformRating();
      }
    }
  }
}

class RedsBonusB implements IBonus {
  readonly id = 'Rb02' as const;
  readonly description = 'The player(s) with the fewest tiles ON MARS gain 1 TR';

  getScore(player: IPlayer): number {
    return tilesOnMars(player);
  }

  grant(game: IGame) {
    if (game.isSoloMode()) {
      return;
    }
    const min = Math.min(...game.players.map(tilesOnMars));
    for (const player of game.players) {
      if (tilesOnMars(player) === min) {
        player.increaseTerraformRating();
      }
    }
  }
}

const POLICY_1: IPolicy = {
  id: 'Rp01',
  // The cost itself is charged by the same machinery as the standard Reds policy, see GigaHooks.redsPaysForTerraforming.
  description: 'Pay 3 M€ every time you gain 1 TR',
};

const POLICY_2: IPolicy = {
  id: 'Rp02',
  description: 'Discard a card every time you play a standard project',
  onStandardProject(player: IPlayer) {
    if (player.cardsInHand.length > 0) {
      player.game.defer(new DiscardCards(player, 1, 1));
    }
  },
};

const POLICY_3: IPolicy = {
  id: 'Rp03',
  description: 'Pay 3 M€ every time you place a tile ON MARS',
  onTilePlaced(player: IPlayer, space: Space) {
    if (isOnMars(player.game, space)) {
      player.stock.deduct(Resource.MEGACREDITS, Math.min(3, player.megaCredits), {log: true, from});
    }
  },
};

const POLICY_4: IPolicy = {
  id: 'Rp04',
  description: 'Decrease your M€ production 1 step every time a Mars global parameter is raised',
  onMarsParameterRaised(player: IPlayer, _parameter: GlobalParameter, steps: number) {
    player.production.add(Resource.MEGACREDITS, -steps, {log: true, from});
  },
};

export class GigaReds extends Party implements IParty {
  readonly name = PartyName.REDS;
  readonly bonuses = [new RedsBonusA(), new RedsBonusB()];
  readonly policies = [POLICY_1, POLICY_2, POLICY_3, POLICY_4];
}
