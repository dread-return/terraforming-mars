import {CardName} from '../../common/cards/CardName';
import {CardResource} from '../../common/CardResource';
import {Resource} from '../../common/Resource';

/** What a placing player gets for putting a tile next to an ocean postlude. */
export type PostludeAdjacencyBonus =
  {stock: Resource, count: number} |
  {cardResource: CardResource} |
  {cards: number} |
  {standardResource: number};

/** The adjacency bonus printed on each ocean postlude. Marine Aquarium and Mobile Launch Station follow their icons. */
export const POSTLUDE_ADJACENCY: Readonly<Partial<Record<CardName, PostludeAdjacencyBonus>>> = {
  [CardName.AQUATIC_LIFE_LABORATORY]: {cardResource: CardResource.SCIENCE},
  [CardName.CLOUD_GENERATOR]: {cardResource: CardResource.FLOATER},
  [CardName.DEEP_SEA_MINING_RIG]: {stock: Resource.STEEL, count: 1},
  [CardName.FLOATING_THERMAL_PLANT]: {stock: Resource.HEAT, count: 1},
  [CardName.HYDRAULIC_POWER_PLANT]: {stock: Resource.ENERGY, count: 1},
  [CardName.MARINE_AQUARIUM]: {cardResource: CardResource.ANIMAL},
  [CardName.MOBILE_LAUNCH_STATION]: {stock: Resource.TITANIUM, count: 1},
  [CardName.OCEAN_GREEN_FARM]: {stock: Resource.PLANTS, count: 1},
  [CardName.RESEARCH_WATCHTOWER]: {cards: 1},
  [CardName.SEA_ORBITER]: {cardResource: CardResource.DATA},
  [CardName.UNDERWATER_RESORT]: {stock: Resource.MEGACREDITS, count: 2},
  [CardName.SPORT_DIVING_SCHOOL]: {stock: Resource.MEGACREDITS, count: 2},
  [CardName.WATER_RECYCLE_COMPLEX]: {cardResource: CardResource.MICROBE},
  [CardName.SKY_ELEVATOR]: {standardResource: 1},
};
