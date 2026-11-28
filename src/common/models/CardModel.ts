import {Units} from '../Units';
import {CardName} from '../cards/CardName';
import {Resource} from '../Resource';
import {AdditionalProjectCosts, CardDiscount, StandardProjectCanPayWith} from '../cards/Types';
import {Tag} from '../cards/Tag';
import {Warning} from '../cards/Warning';

export interface CardModel {
    name: CardName;
    resources?: number;
    calculatedCost?: number;
    isSelfReplicatingRobotsCard?: boolean,
    discount?: Array<CardDiscount>,
    isDisabled?: boolean; // Used with Pharmacy Union
    additionalProjectCosts?: AdditionalProjectCosts;
    warnings?: ReadonlyArray<Warning>;
    reserveUnits?: Readonly<Units>; // Written for The Moon, but useful in other contexts.
    bonusResource?: Array<Resource>; // Used with the Mining cards and Robotic Workforce
    cloneTag?: Tag; // Used with Pathfinders
    gulag?: number; // Epic Corporations: communes in Soviet Mars's gulag
    diseases?: number; // Epic Corporations: Panacea Biologics' diseases on this (infected player's) corporation
    standardProjectCanPayWith?: StandardProjectCanPayWith; // Set for standard projects; undefined for regular project cards
    /** Steel/titanium allowed (or steel worth more) for this card beyond its tags, e.g. from an Epic corporation. */
    paymentOverrides?: {
      steel?: boolean, titanium?: boolean, steelValue?: number, graphene?: boolean, grapheneValue?: number,
      // Epic Corporations: plants (OmniDrone Labs), energy (Milky Skyway) and corporation resources at these rates.
      plants?: boolean, plantsValue?: number, energy?: boolean, energyValue?: number, epicResources?: boolean, epicValue?: number,
    };
}
