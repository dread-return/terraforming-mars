import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {OrOptions} from '../inputs/OrOptions';
import {SelectOption} from '../inputs/SelectOption';
import {Resource} from '../../common/Resource';
import {Tag} from '../../common/cards/Tag';
import {PathfindersExpansion} from '../pathfinders/PathfindersExpansion';
import {message} from '../logs/MessageBuilder';

/** From this generation on, the chairman may also pick from the outer ring of the wheel. */
export const OUTER_RING_GENERATION = 11;

type WheelReward = {
  /** Text shown on the option, also logged. */
  readonly description: string;
  /** False when the reward cannot be given in this game (e.g. a Mars track without Pathfinders). */
  readonly available?: (player: IPlayer) => boolean;
  readonly grant: (player: IPlayer) => void;
};

function megacredits(amount: number): WheelReward {
  return {
    description: `Gain ${amount} M€`,
    grant: (player) => player.stock.add(Resource.MEGACREDITS, amount, {log: true}),
  };
}

function megacreditProduction(amount: number): WheelReward {
  return {
    description: `Increase your M€ production ${amount} step${amount === 1 ? '' : 's'}`,
    grant: (player) => player.production.add(Resource.MEGACREDITS, amount, {log: true}),
  };
}

function cards(amount: number): WheelReward {
  return {
    description: `Draw ${amount} cards`,
    grant: (player) => player.drawCard(amount),
  };
}

function terraformRating(amount: number): WheelReward {
  return {
    description: `Raise your terraform rating ${amount} step${amount === 1 ? '' : 's'}`,
    grant: (player) => player.increaseTerraformRating(amount, {log: true}),
  };
}

function influence(amount: number): WheelReward {
  return {
    description: `Gain ${amount} influence`,
    grant: (player) => {
      player.game.turmoil?.addInfluenceBonus(player, amount);
      player.game.log('${0} gained ${1} influence', (b) => b.player(player).number(amount));
    },
  };
}

function marsTrack(steps: number): WheelReward {
  return {
    description: `Raise the Mars track ${steps} steps`,
    available: (player) => player.game.pathfindersData !== undefined,
    grant: (player) => PathfindersExpansion.raiseTrack(Tag.MARS, player, steps),
  };
}

/**
 * The chairman wheel of the GIGA board. The inner ring is always available, the outer ring
 * is more generous and opens up in generation 11.
 *
 * Reading of the board, in clockwise order from the top right: Mars track, terraform rating, M€, M€ production,
 * cards, influence. The inner ring's terraform rating option is the standard +1 TR.
 */
export const INNER_RING: ReadonlyArray<WheelReward> = [
  terraformRating(1),
  influence(1),
  marsTrack(2),
  megacredits(8),
  megacreditProduction(2),
  cards(2),
];

export const OUTER_RING: ReadonlyArray<WheelReward> = [
  terraformRating(2),
  influence(2),
  marsTrack(3),
  megacredits(20),
  megacreditProduction(5),
  cards(5),
];

export function availableWheelRewards(player: IPlayer, generation: number): ReadonlyArray<WheelReward> {
  const rewards = generation >= OUTER_RING_GENERATION ? [...INNER_RING, ...OUTER_RING] : INNER_RING;
  return rewards.filter((reward) => reward.available?.(player) !== false);
}

/** The input the new chairman uses to pick their reward. */
export function chairmanWheelInput(player: IPlayer): PlayerInput {
  const game = player.game;
  const rewards = availableWheelRewards(player, game.generation);
  const options = rewards.map((reward) => {
    return new SelectOption(reward.description).andThen(() => {
      game.log('${0} is the new chairman and chose: ${1}', (b) => b.player(player).string(reward.description));
      reward.grant(player);
      return undefined;
    });
  });
  return new OrOptions(...options).setTitle(message('Choose your chairman reward'));
}
