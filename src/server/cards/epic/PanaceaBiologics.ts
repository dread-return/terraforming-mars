import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {all} from '../Options';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {PlayerInput} from '../../PlayerInput';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {message} from '../../logs/MessageBuilder';

type PanaceaData = {
  /** Diseases on each opponent's corporation, by player id. */
  diseases?: Record<string, number>,
};

/**
 * Panacea Biologics (replaces Quash, 2026-11-28): a vaccine monopoly. It spreads diseases onto opponents'
 * corporations; each disease makes that player's cards cost 1 M€ more until they buy the cure from it.
 *
 * - Card cost: EpicHooks.cardCostAdjustment. Cure: EpicHooks.freeActionOption. Not dealt in solo games
 *   (EpicHooks.NOT_IN_SOLO). The badges on infected corporations: ModelUtils (`CardModel.diseases`).
 */
export class PanaceaBiologics extends ActiveCorporationCard implements ICorporationCard {
  public static readonly MAX_DISEASES = 3;
  public static readonly BASE_CURE_PRICE = 3;
  public static readonly MAX_CURE_PRICE = 6;

  constructor() {
    super({
      name: CardName.PANACEA_BIOLOGICS,
      tags: [Tag.MICROBE, Tag.SCIENCE],
      startingMegaCredits: 40,
      resourceType: CardResource.PATENT,
      victoryPoints: {resourcesHere: {}, per: 2},
      initialActionText: 'Patient Zero: put 1 disease on each opponent\'s corporation',
      action: {},

      metadata: {
        cardNumber: 'EP-PAN',
        description: 'You start with 40 M€. First action: 1 disease on each opponent.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).nbsp.resource(CardResource.DISEASE).asterix().br;
          b.effect('Any microbe tag: you may put a disease on an opponent\'s corporation (max 3 each).', (eb) => {
            eb.tag(Tag.MICROBE, {all}).startEffect.resource(CardResource.DISEASE).asterix();
          }).br;
          b.effect(undefined, (eb) => {
            eb.resource(CardResource.DISEASE, {all}).startEffect.cards(1, {all}).megacredits(1, {text: '+1'});
          }).br;
          b.effect('Each disease on a player\'s corporation: their cards cost 1 M€ more. *They may pay you 3 M€ (+1 per 2 of your science tags, max 6) to cure one: add a patent here.', (eb) => {
            eb.megacredits(3, {all}).asterix().startEffect.megacredits(3).resource(CardResource.PATENT);
          }).br;
          b.action('Remove 1 microbe from any of your cards: spread a disease.', (eb) => {
            eb.resource(CardResource.MICROBE).startAction.resource(CardResource.DISEASE).asterix();
          });
        }),
      },
    });
  }

  public data: PanaceaData = {};

  private get diseases(): Record<string, number> {
    this.data.diseases ??= {};
    return this.data.diseases;
  }

  /** What `owner` charges for a cure: 3 M€, +1 per 2 science tags, at most 6. */
  public static curePrice(owner: IPlayer): number {
    const science = owner.tags.count(Tag.SCIENCE);
    return Math.min(PanaceaBiologics.MAX_CURE_PRICE, PanaceaBiologics.BASE_CURE_PRICE + Math.floor(science / 2));
  }

  private infectable(owner: IPlayer): Array<IPlayer> {
    return owner.opponents.filter((p) => (this.diseases[p.id] ?? 0) < PanaceaBiologics.MAX_DISEASES);
  }

  private infect(owner: IPlayer, target: IPlayer) {
    const count = this.diseases[target.id] ?? 0;
    if (count >= PanaceaBiologics.MAX_DISEASES) {
      return;
    }
    this.diseases[target.id] = count + 1;
    owner.game.log('${0} spread a disease to ${1} (${2} on their corporation)', (b) => b.player(owner).player(target).number(count + 1));
  }

  /** Asks `owner` which opponent to infect; `optional` adds a "don't" choice. */
  private chooseTarget(owner: IPlayer, optional: boolean): PlayerInput | undefined {
    const targets = this.infectable(owner);
    if (targets.length === 0) {
      return undefined;
    }
    const options = targets.map((target) => new SelectOption(
      message('Put a disease on ${0}\'s corporation (${1} there now)', (b) => b.player(target).number(this.diseases[target.id] ?? 0)), 'Infect')
      .andThen(() => {
        this.infect(owner, target);
        return undefined;
      }));
    if (optional) {
      options.push(new SelectOption('Don\'t spread a disease', 'Skip').andThen(() => undefined));
    }
    if (options.length === 1) {
      return options[0];
    }
    return new OrOptions(...options).setTitle('Panacea Biologics: choose who gets sick');
  }

  // Patient Zero: 1 disease on each opponent's corporation.
  public override initialAction(player: IPlayer) {
    for (const opponent of player.opponents) {
      this.infect(player, opponent);
    }
    return undefined;
  }

  // Outbreak: any microbe tag (its own card excepted) lets the owner infect an opponent.
  public onCardPlayedByAnyPlayer(owner: IPlayer, card: ICard, activePlayer: IPlayer) {
    if (card === this) {
      return;
    }
    const microbes = activePlayer.tags.cardTagCount(card, Tag.MICROBE);
    for (let i = 0; i < microbes; i++) {
      owner.game.defer(new SimpleDeferredAction(owner, () => this.chooseTarget(owner, true)));
    }
  }

  private microbeCards(player: IPlayer): Array<ICard> {
    return player.getResourceCards(CardResource.MICROBE).filter((c) => c.resourceCount > 0);
  }

  // Field trial: 1 microbe from any of your cards spreads a disease.
  public override bespokeCanAct(player: IPlayer) {
    return this.microbeCards(player).length > 0 && this.infectable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const spend = (card: ICard) => {
      player.removeResourceFrom(card, 1, {log: true});
      player.defer(() => this.chooseTarget(player, false));
    };
    const cards = this.microbeCards(player);
    if (cards.length === 1) {
      spend(cards[0]);
      return undefined;
    }
    return new SelectCard('Remove 1 microbe from which card?', 'Remove', cards).andThen(([card]) => {
      spend(card);
      return undefined;
    });
  }

  /** The cure, offered to an infected player as a free action (see EpicHooks.freeActionOption). */
  public cureOption(owner: IPlayer, player: IPlayer): SelectOption | undefined {
    const count = this.diseases[player.id] ?? 0;
    const price = PanaceaBiologics.curePrice(owner);
    if (count === 0 || player === owner || !player.canAfford(price)) {
      return undefined;
    }
    return new SelectOption(message('Panacea Biologics: pay ${0} M€ to cure 1 disease', (b) => b.number(price)), 'Cure').andThen(() => {
      player.freeActionTaken = true;
      player.game.defer(new SelectPaymentDeferred(player, price, {title: 'Panacea Biologics: pay for the cure'}).andThen(() => {
        this.diseases[player.id] = Math.max(0, (this.diseases[player.id] ?? 0) - 1);
        owner.stock.add(Resource.MEGACREDITS, price, {log: true, from: {player}});
        owner.addResourceTo(this, {qty: 1, log: true});
        player.game.log('${0} bought a cure from ${1}', (b) => b.player(player).player(owner));
      }));
      return undefined;
    });
  }
}
