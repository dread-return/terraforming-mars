import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {IGame} from '../../../IGame';
import {Size} from '../../../../common/cards/render/Size';
import {digit} from '../../../cards/Options';
import {PlaceOceanTile} from '../../../deferredActions/PlaceOceanTile';
import {RemoveOceanTile} from '../../../deferredActions/RemoveOceanTile';
import * as constants from '../../../../common/constants';
import {influenceOf, setsOfTrOverFifteen, lose, deferLast, chooseOne} from './GigaEventHelpers';

type Parameter = 'oxygen' | 'temperature' | 'ocean';
const PARAMETERS: ReadonlyArray<Parameter> = ['oxygen', 'temperature', 'ocean'];

const RAISE_TITLES: Record<Parameter, string> = {
  oxygen: 'Raise the oxygen level 1 step',
  temperature: 'Raise the temperature 1 step',
  ocean: 'Place an ocean tile',
};

const LOWER_TITLES: Record<Parameter, string> = {
  oxygen: 'Lower the oxygen level 1 step',
  temperature: 'Lower the temperature 1 step',
  ocean: 'Remove an ocean tile',
};

function canRaise(game: IGame, parameter: Parameter): boolean {
  switch (parameter) {
  case 'oxygen': return game.getOxygenLevel() < game.max.oxygen;
  case 'temperature': return game.getTemperature() < game.max.temperature;
  case 'ocean': return game.canAddOcean();
  }
}

// A parameter that has reached its maximum cannot be lowered.
function canLower(game: IGame, parameter: Parameter): boolean {
  switch (parameter) {
  case 'oxygen': return game.getOxygenLevel() > constants.MIN_OXYGEN_LEVEL && game.getOxygenLevel() < game.max.oxygen;
  case 'temperature': return game.getTemperature() > constants.MIN_TEMPERATURE && game.getTemperature() < game.max.temperature;
  case 'ocean': return game.canRemoveOcean();
  }
}

// Global events never give TR for raising a parameter, and lowering one never costs TR.
function raise(game: IGame, player: IPlayer, parameter: Parameter): void {
  switch (parameter) {
  case 'oxygen': game.increaseOxygenLevel(player, 1); break;
  case 'temperature': game.increaseTemperature(player, 1); break;
  case 'ocean': game.defer(new PlaceOceanTile(player)); break;
  }
  game.log('${0} raised a global parameter for Radical Geoengineering: ${1}', (b) => b.player(player).string(RAISE_TITLES[parameter]));
}

function lower(game: IGame, player: IPlayer, parameter: Parameter): void {
  switch (parameter) {
  case 'oxygen': game.increaseOxygenLevel(player, -1); break;
  case 'temperature': game.increaseTemperature(player, -1); break;
  case 'ocean': game.defer(new RemoveOceanTile(player, 'Radical Geoengineering Global Event - Remove an Ocean tile from the board')); break;
  }
  game.log('${0} lowered a global parameter for Radical Geoengineering: ${1}', (b) => b.player(player).string(LOWER_TITLES[parameter]));
}

export class RadicalGeoengineering extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.RADICAL_GEOENGINEERING,
      description: 'The first player raises one global parameter (oxygen, temperature or an ocean) and lowers a different one. Lose 1 steel per set of 5 TR over 15 (max 5), reduced by influence.',
      revealedDelegate: PartyName.EMPOWER,
      currentDelegate: PartyName.CENTRISTS,
      renderData: CardRenderer.builder((b) => {
        b.plus().oxygen(1).slash().temperature(1).slash().oceans(1).br;
        b.minus().oxygen(1).slash().temperature(1).slash().oceans(1).nbsp.steel(-1).slash().tr(5, {digit, over: 15}).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    const first = game.playersInGenerationOrder[0];
    chooseOne(first, 'Radical Geoengineering - select a global parameter to raise',
      PARAMETERS.filter((parameter) => canRaise(game, parameter)).map((parameter) => ({
        title: RAISE_TITLES[parameter],
        apply: () => {
          raise(game, first, parameter);
          chooseOne(first, 'Radical Geoengineering - select a different global parameter to lower',
            PARAMETERS.filter((other) => other !== parameter && canLower(game, other)).map((other) => ({
              title: LOWER_TITLES[other],
              apply: () => lower(game, first, other),
            })));
        },
      })));
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    // After the first player's choices, so that their TR is up to date.
    deferLast(player, () => {
      lose(player, Resource.STEEL, Math.max(0, setsOfTrOverFifteen(player) - influenceOf(player)), this);
      return undefined;
    });
  }
}
