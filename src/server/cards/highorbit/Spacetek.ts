import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SerializedCard} from '../../SerializedCard';

export const SPACETEK_ACTION_COST = 13;

/**
 * Effect: gain 1 titanium per step any player's titanium production goes up (HighOrbit.onProductionIncrease).
 * Action: 13 M€ for 1 titanium production. Any player may use it, once per generation in all
 * (HighOrbit.spacetekOptions offers it to the other players).
 */
export class Spacetek extends CorporationCard implements ICorporationCard, IActionCard {
  /** Set once the corporation is in play, so its own starting production doesn't pay out. Not serialized. */
  public started = false;
  /** The generation in which someone last used the action. Saved with the game. */
  public generationUsed: number | undefined = undefined;

  constructor() {
    super({
      name: CardName.SPACETEK,
      tags: [Tag.SPACE],
      startingMegaCredits: 39,
      behavior: {
        production: {titanium: 1},
      },
      metadata: {
        cardNumber: 'HO80',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(39).nbsp.production((pb) => pb.titanium(1));
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.effect('Gain 1 titanium per step ANY titanium production goes up.', (eb) => {
              eb.production((pb) => pb.titanium(1, {all: true})).startEffect.titanium(1);
            });
            ce.action('13 M€: +1 titanium production. Any player may use it.', (eb) => {
              eb.megacredits(SPACETEK_ACTION_COST).startAction.production((pb) => pb.titanium(1)).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay() {
    this.started = true;
    return undefined;
  }

  /** Whether anyone used the action this generation. */
  public usedThisGeneration(player: IPlayer): boolean {
    return this.generationUsed === player.game.generation;
  }

  public canUse(player: IPlayer): boolean {
    return !this.usedThisGeneration(player) && player.canAfford(SPACETEK_ACTION_COST);
  }

  public canAct(player: IPlayer): boolean {
    return this.canUse(player);
  }

  /** `user` takes the action, whether or not they own Spacetek. */
  public use(user: IPlayer): void {
    this.generationUsed = user.game.generation;
    user.game.defer(new SelectPaymentDeferred(user, SPACETEK_ACTION_COST, {title: 'Select how to pay for the Spacetek action'}))
      .andThen(() => {
        user.production.add(Resource.TITANIUM, 1, {log: true});
        user.game.log('${0} used the action of ${1}', (b) => b.player(user).card(this));
      });
  }

  public action(player: IPlayer) {
    this.use(player);
    return undefined;
  }

  public serialize(serialized: SerializedCard) {
    serialized.generationUsed = this.generationUsed;
  }

  public deserialize(serialized: SerializedCard) {
    this.generationUsed = serialized.generationUsed;
    this.started = true;
  }
}
