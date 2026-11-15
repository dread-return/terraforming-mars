import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {infrastructureDesign} from '../../../common/highOrbit/HighOrbit';
import {ActionCard, StaticActionCardProperties} from '../ActionCard';
import {Card, StaticCardProperties} from '../Card';
import {IProjectCard} from '../IProjectCard';

export type InfrastructureProperties = Omit<StaticCardProperties, 'name' | 'type' | 'cost'>;
export type InfrastructureActionProperties = Omit<StaticActionCardProperties, 'name' | 'type' | 'cost'>;

/**
 * Fills in what every copy of an infrastructure shares: the copy's name, the silver card type, the titanium cost
 * from the stack, the infrastructure tag and the "more space tags than infrastructure tags" requirement badge.
 */
export function infrastructureProperties<T extends InfrastructureProperties>(base: CardName, copy: number, properties: T): T & {name: CardName, type: CardType, cost: number} {
  const design = infrastructureDesign(base);
  if (design === undefined || design.name !== base) {
    throw new Error(`${base} is not an infrastructure stack`);
  }
  const name = design.copies[copy - 1];
  if (name === undefined) {
    throw new Error(`${base} has no copy ${copy}`);
  }
  return {
    ...properties,
    name,
    type: CardType.INFRASTRUCTURE,
    cost: design.cost,
    tags: [...(properties.tags ?? []), Tag.INFRASTRUCTURE],
    requirements: {display: 'spaceOverInfrastructure'},
  };
}

/**
 * A High Orbit silver card. It is bought from its stack with titanium (see HighOrbit.buy), never drawn or held in hand.
 * `cost` is the titanium cost.
 */
export abstract class InfrastructureCard extends Card implements IProjectCard {
  constructor(base: CardName, copy: number, properties: InfrastructureProperties) {
    super(infrastructureProperties(base, copy, properties));
  }
}

/** A silver card whose action is written with the behavior language. */
export abstract class InfrastructureActionCard extends ActionCard implements IProjectCard {
  constructor(base: CardName, copy: number, properties: InfrastructureActionProperties) {
    super(infrastructureProperties(base, copy, properties));
  }
}
