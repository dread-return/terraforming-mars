import {BoardName} from '@/common/boards/BoardName';
import {RandomBoardOption} from '@/common/boards/RandomBoardOption';

const OFFICIAL_BOARDS = [
  BoardName.THARSIS,
  BoardName.HELLAS,
  BoardName.ELYSIUM,
  BoardName.UTOPIA_PLANITIA,
  BoardName.VASTITAS_BOREALIS_NOVA,
  BoardName.TERRA_CIMMERIA_NOVA,
];

export function boardOptions(board: RandomBoardOption): Array<BoardName> {
  // The GIGA board is a different game, so it is never picked at random.
  const allBoards = Object.values(BoardName).filter((boardName) => boardName !== BoardName.GIGA);

  switch (board) {
  case RandomBoardOption.ALL:
    return allBoards;
  case RandomBoardOption.OFFICIAL:
    return OFFICIAL_BOARDS;
  default:
    throw new Error('Unknown random board option :' + board);
  }
}
