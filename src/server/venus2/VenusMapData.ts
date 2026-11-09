import {IPlayer} from '../IPlayer';
import {Board} from '../boards/Board';
import {SerializedBoard} from '../boards/SerializedBoard';
import {VenusBoard} from './VenusBoard';

/** Game state for the Venus Phase 2 map. */
export type VenusMapData = {
  board: VenusBoard;
}

export type SerializedVenusMapData = {
  board: SerializedBoard;
}

export namespace VenusMapData {
  export function serialize(data: VenusMapData | undefined): SerializedVenusMapData | undefined {
    if (data === undefined) {
      return undefined;
    }
    return {board: data.board.serialize()};
  }

  export function deserialize(data: SerializedVenusMapData, players: ReadonlyArray<IPlayer>): VenusMapData {
    const spaces = Board.deserialize(data.board, players).spaces;
    return {board: new VenusBoard(spaces)};
  }
}
