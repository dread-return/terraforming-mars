import {highOrbitStandardProjectPayWith} from '../highOrbit/HighOrbitPayWith';
import {Postludes} from '../postludes/Postludes';
import {Payment} from '../../common/inputs/Payment';
import {IStandardProjectCard} from '../cards/IStandardProjectCard';
import {CardAction, IPlayer} from '../IPlayer';
import {SelectProjectCardToPlayResponse} from '../../common/inputs/InputResponse';
import {CardName} from '../../common/cards/CardName';
import {InputError} from './InputError';
import {PaymentOptions} from '../../common/inputs/Payment';
import {StandardProjectCanPayWith} from '../../common/cards/Types';
import {Message} from '../../common/logs/Message';
import {PlayCardMetadata, SelectCardToPlay} from './SelectCardToPlay';
import {VenusPhase2Expansion} from '../venus2/VenusPhase2Expansion';
import {SelectProjectCardToPlayModel} from '../../common/models/PlayerInputModel';
import {Eternity} from '../cards/eternity/Eternity';
import {EpicHooks} from '../cards/epic/EpicHooks';

export class SelectStandardProjectToPlay extends SelectCardToPlay<IStandardProjectCard> {
  constructor(
    player: IPlayer,
    cards: ReadonlyArray<IStandardProjectCard>,
    config?: {
      action?: CardAction,
      enabled?: ReadonlyArray<boolean>,
      title?: string | Message,
      buttonLabel?: string,
      adjustedCost?: (card: IStandardProjectCard) => number,
    }) {
    super(player, cards, config);
    this.buttonLabel = config?.buttonLabel ?? 'Play Standard Project';
  }

  /**
   * What `card` may be paid with right now: its own rules plus every expansion's hooks (Coeurl's steel and titanium,
   * Venus floaters, High Orbit ore...). `validate` checks payments against this, and bots build theirs from it.
   */
  public paymentRulesFor(card: IStandardProjectCard): {canPayWith: StandardProjectCanPayWith, paymentOptions: Partial<PaymentOptions>} {
    const canPayWith = highOrbitStandardProjectPayWith(this.player, card, Postludes.standardProjectPayWith(this.player, card, Eternity.standardProjectPayWith(this.player, card, EpicHooks.standardProjectPayWith(this.player, card, card.canPayWith(this.player)))));
    const paymentOptions: Partial<PaymentOptions> = {
      heat: this.player.canUseHeatAsMegaCredits,
      steel: canPayWith.steel,
      titanium: canPayWith.titanium,
      lunaTradeFederationTitanium: this.player.canUseTitaniumAsMegacredits,
      seeds: canPayWith.seeds,
      auroraiData: this.player.tableau.has(CardName.AURORAI),
      spireScience: this.player.tableau.has(CardName.SPIRE),
      kuiperAsteroids: canPayWith.kuiperAsteroids ? this.player.tableau.has(CardName.KUIPER_COOPERATIVE) : false,
      shipyardOre: canPayWith.shipyardOre === true,
      // Epic Corporations: Microfac's microbes and Milky Skyway's energy.
      epicResources: canPayWith.epicResources === true,
      energy: this.player.canUseEnergyAsMegaCredits || canPayWith.energy === true,
    };
    return {canPayWith, paymentOptions};
  }

  public validate(card: IStandardProjectCard, input: SelectProjectCardToPlayResponse, details: PlayCardMetadata) {
    // The client greys out projects whose canAct is false (via the `enabled` array), but the
    // server must enforce it too: process() never consults `enabled`, and projects whose
    // requirement isn't just the M€ cost (e.g. Collusion spending corruption) would otherwise
    // execute regardless. See https://github.com/terraforming-mars/terraforming-mars/issues/8238.
    //
    // This only matters for menus that offer non-actable projects (the standard projects menu and
    // Established Methods). A discounted play (overriddenCost set, e.g. Standard Technology) is
    // already handed a canAct-filtered list, so re-checking here is redundant and, worse, would
    // re-evaluate affordability at the full undiscounted cost and reject a play the player can
    // afford at the discount. See https://github.com/terraforming-mars/terraforming-mars/issues/8247.
    if (details.overriddenCost === undefined && !card.canAct(this.player)) {
      throw new InputError('You cannot play this standard project');
    }
    const {canPayWith, paymentOptions} = this.paymentRulesFor(card);

    const reserveUnits = details.reserveUnits;

    // Venus Phase 2: floaters from any card pay for Venus standard projects.
    let floaterCredit = 0;
    let payment = input.payment;
    if (canPayWith.floaters === true && payment.floaters > 0) {
      if (payment.floaters > VenusPhase2Expansion.floatersOnCards(this.player)) {
        throw new InputError('You do not have that many floaters');
      }
      floaterCredit = payment.floaters * VenusPhase2Expansion.floaterValue(this.player);
      payment = {...payment, floaters: 0};
    }

    // Eternity (Venusia): heat pays for standard projects at its own rate.
    if (canPayWith.heat === true && canPayWith.heatValue !== undefined && payment.heat > 0) {
      if (payment.heat > this.player.heat) {
        throw new InputError('You do not have that much heat');
      }
      floaterCredit += payment.heat * canPayWith.heatValue;
      payment = {...payment, heat: 0};
    }

    if (!this.player.canSpend(payment, reserveUnits)) {
      throw new InputError('You do not have that many resources');
    }
    const amountPaid = this.player.payingAmount(payment, {...paymentOptions, epicValue: canPayWith.epicValue, energyValue: canPayWith.energyValue}) + floaterCredit;
    const requiredCost = details.overriddenCost ?? card.getAdjustedCost(this.player);
    if (amountPaid < requiredCost) {
      throw new InputError('Did not spend enough to pay for standard project');
    }
    return undefined;
  }

  public override toModel(player: IPlayer): SelectProjectCardToPlayModel {
    const model = super.toModel(player);
    // Venus Phase 2: Venus standard projects take floaters from any card.
    if (this.cards.some((card) => card.canPayWith(player).floaters === true)) {
      return {
        ...model,
        floaters: VenusPhase2Expansion.floatersOnCards(player),
        floaterValue: VenusPhase2Expansion.floaterValue(player),
      };
    }
    return model;
  }

  // Public for tests
  public payAndPlay(card: IStandardProjectCard, payment: Payment) {
    card.payAndExecute(this.player, payment);
    this.cb(card);
  }
}
