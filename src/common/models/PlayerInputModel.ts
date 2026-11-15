import {InfrastructureSectorModel} from '../highOrbit/HighOrbit';
import {CardModel} from './CardModel';
import {ColonyModel} from './ColonyModel';
import {Color, ColorWithNeutral} from '../Color';
import {PayProductionModel} from './PayProductionUnitsModel';
import {AresData} from '../ares/AresData';
import {Message} from '../logs/Message';
import {PartyName} from '../turmoil/PartyName';
import {SpaceId} from '../Types';
import {PaymentOptions} from '../inputs/Payment';
import {GlobalEventName} from '../turmoil/globalEvents/GlobalEventName';
import {Warning} from '../cards/Warning';
import {Units} from '../Units';
import {ClaimedToken} from '../underworld/UnderworldPlayerData';

export type BaseInputModel = {
  title: string | Message;
  warning?: string | Message;
  buttonLabel: string;
  optional?: boolean;
}

export type AndOptionsModel = BaseInputModel & {
  type: 'and';
  options: Array<PlayerInputModel>;
}

export type OrOptionsModel = BaseInputModel & {
  type: 'or';
  options: Array<PlayerInputModel>;
  // When set, initialIdx represents the option within `options` that should be
  // shows as the default selection.
  initialIdx?: number;
}

export type SelectInitialCardsModel = BaseInputModel & {
  type: 'initialCards';
  options: Array<PlayerInputModel>;
}

export type SelectOptionModel = BaseInputModel & {
  type: 'option';
  warnings?: ReadonlyArray<Warning>;
}

export type SelectProjectCardToPlayModel = BaseInputModel & {
  type: 'projectCard';
  cards: ReadonlyArray<CardModel>;
  paymentOptions: Partial<PaymentOptions>,
  microbes: number;
  floaters: number;
  /** Venus Phase 2: value of a floater when paying for a Venus standard project (3, or 4 with Negative Mass Fluids). */
  floaterValue?: number;
  lunaArchivesScience: number;
  seeds: number;
  graphene: number;
  kuiperAsteroids: number;
  /** High Orbit: ore on Propellant Depot (2 M€ each for Venus, Moon and Jovian cards). */
  propellantOre: number;
  /** High Orbit: ore on Orbital Shipyard (3 M€ each for the Build Colony standard project). */
  shipyardOre: number;
  auroraiData: number;
  spireScience: number;
}

export type SelectCardModel = BaseInputModel & {
  type: 'card';
  cards: ReadonlyArray<CardModel>;
  max: number;
  min: number;
  showOnlyInLearnerMode: boolean;
  selectBlueCardAction: boolean;
  showOwner: boolean;
  showSelectAll: boolean;
}

export type SelectColonyModel = BaseInputModel & {
  type: 'colony';
  coloniesModel: ReadonlyArray<ColonyModel>;
}

export type SelectPaymentModel = BaseInputModel & {
  type: 'payment';
  amount: number;
  paymentOptions: Partial<PaymentOptions>;
  seeds: number;
  auroraiData: number;
  kuiperAsteroids: number;
  spireScience: number;
  reserveUnits: Readonly<Units> | undefined; // Built to support the Merchant milestone.

  floaters: 0,
  microbes: 0,
  graphene: 0,
  propellantOre: 0,
  shipyardOre: 0,
}

export type SelectPlayerModel = BaseInputModel & {
  type: 'player';
  players: ReadonlyArray<Color>;
}

export type SelectSpaceModel = BaseInputModel & {
  type: 'space';
  spaces: ReadonlyArray<SpaceId>;
}

export type SelectAmountModel = BaseInputModel & {
  type: 'amount';
  min: number;
  max: number;
  maxByDefault: boolean;
}

/** High Orbit: the Infrastructures menu. */
export type SelectInfrastructureModel = BaseInputModel & {
  type: 'infrastructure';
  sectors: Array<InfrastructureSectorModel>;
  titanium: number;
}

export type DeltaProjectInputModel = BaseInputModel & {
  type: 'deltaProject';
  validSteps: ReadonlyArray<number>;
}

export type SelectDelegateModel = BaseInputModel & {
  type: 'delegate';
  players: Array<ColorWithNeutral>;
}

export type SelectPartyModel = BaseInputModel & {
  type: 'party';
  parties: Array<PartyName>;
}

export type SelectProductionToLoseModel = BaseInputModel & {
  type: 'productionToLose';
  payProduction: PayProductionModel;
}

export type ShiftAresGlobalParametersModel = BaseInputModel & {
  type: 'aresGlobalParameters';
  aresData: AresData;
}

export type SelectGlobalEventModel = BaseInputModel & {
  type: 'globalEvent';
  globalEventNames: Array<GlobalEventName>;
}

export type SelectResourceModel = BaseInputModel & {
  type: 'resource';
  include: ReadonlyArray<keyof Units>;
}

export type SelectResourcesModel = BaseInputModel & {
  type: 'resources';
  count: number;
}

export type SelectClaimedUndergroundTokenModel = BaseInputModel & {
  type: 'claimedUndergroundToken';
  max: number;
  min: number;
  tokens: ReadonlyArray<ClaimedToken>;
}

export type PlayerInputModel =
  AndOptionsModel |
  OrOptionsModel |
  SelectInitialCardsModel |
  SelectOptionModel |
  SelectProjectCardToPlayModel |
  SelectCardModel |
  SelectAmountModel |
  SelectCardModel |
  SelectColonyModel |
  SelectDelegateModel |
  SelectPartyModel |
  SelectPaymentModel |
  SelectPlayerModel |
  SelectProductionToLoseModel |
  SelectProjectCardToPlayModel |
  SelectSpaceModel |
  ShiftAresGlobalParametersModel |
  SelectGlobalEventModel |
  SelectResourceModel |
  SelectResourcesModel |
  SelectClaimedUndergroundTokenModel |
  DeltaProjectInputModel |
  SelectInfrastructureModel;
