import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {getBehaviorExecutor} from '../../behavior/BehaviorExecutor';
import {Behavior} from '../../behavior/Behavior';

export class Prototek extends CorporationCard {
  constructor() {
    super({
      name: CardName.PROTOTEK,
      tags: [],
      startingMegaCredits: 40,

      metadata: {
        cardNumber: 'EP-PRT',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play a blue card, you may use its action right away without paying its cost (not for actions with a variable cost).', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.BLUE}).startEffect.text('action', {size: Size.SMALL}).megacredits(0, {text: '0'}).asterix();
            });
          });
        }),
      },
    });
  }

  /** A blue card's declared action without its cost (`spend`), or undefined if the action isn't declared. */
  public static freeAction(card: ICard): Behavior | undefined {
    // The declared action lives in the card's properties (card.action() is the method that runs it).
    const action = (card as unknown as {properties?: {action?: Behavior}}).properties?.action;
    if (action === undefined || card.type !== CardType.ACTIVE) {
      return undefined;
    }
    const strip = (behavior: Behavior): Behavior => {
      const {spend: _spend, ...rest} = behavior;
      if (rest.or !== undefined) {
        rest.or = {...rest.or, behaviors: rest.or.behaviors.map((b) => ({...strip(b), title: b.title}))};
      }
      return rest;
    };
    return strip(action);
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const free = Prototek.freeAction(card);
    if (free === undefined || Object.keys(free).length === 0) {
      return;
    }
    const executor = getBehaviorExecutor();
    if (!executor.canExecute(free, player, card)) {
      return;
    }
    player.defer(new OrOptions(
      new SelectOption(`Use ${card.name}'s action now, for free`).andThen(() => {
        player.game.log('${0} used ${1}\'s action for free (Prototek)', (b) => b.player(player).card(card));
        executor.execute(free, player, card);
        return undefined;
      }),
      new SelectOption('Don\'t use it').andThen(() => undefined),
    ).setTitle('Prototek'));
  }
}
