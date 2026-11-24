import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {PlayerInput} from '../../PlayerInput';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';
import {IPreludeCard} from '../prelude/IPreludeCard';

export class Scavenger extends CorporationCard {
  constructor() {
    super({
      name: CardName.SCAVENGER,
      tags: [Tag.WILD],
      startingMegaCredits: 0,
      initialActionText: 'Take discarded cards for free and play 3 discarded preludes',

      metadata: {
        cardNumber: 'EP-SCV',
        description: 'You start with 0 M€. First action: take any discarded project cards for free, and play up to 3 discarded preludes.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(0, {text: '0'}).text('3').prelude().asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.text('research', {size: Size.SMALL}).startEffect.cards(1, {cancelled: true}).nbsp.megacredits(1).slash().cards(1).asterix();
            });
            ce.vSpace(Size.TINY);
            ce.effect('Research: no new cards; once all have bought, buy any *discarded cards for 1 M€ each. Sell patents: 2 M€ each.', (eb) => {
              eb.text('sell', {size: Size.SMALL}).cards(1).startEffect.megacredits(2);
            });
          });
        }),
      },
    });
  }

  /** Names of the project cards discarded during the current research phase. */
  public data: {discards?: Array<CardName>} = {};

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const preludes = () => {
      const discarded = [...game.preludeDeck.discardPile];
      return this.playPreludes(player, discarded, 3);
    };
    const pile = [...game.projectDeck.discardPile];
    if (pile.length === 0) {
      return preludes();
    }
    return new SelectCard('Scavenger: take any discarded cards for free', 'Take', pile, {min: 0, max: pile.length}).andThen((taken) => {
      Scavenger.take(player, taken);
      return preludes();
    });
  }

  private playPreludes(player: IPlayer, cards: Array<IPreludeCard>, left: number): PlayerInput | undefined {
    if (left === 0 || cards.length === 0 || !player.game.gameOptions.preludeExtension) {
      return undefined;
    }
    const select = PreludesExpansion.selectPreludeToPlay(player, cards);
    const options = new OrOptions(
      new SelectOption(`Play a discarded prelude (${left} left)`).andThen(() => select),
      new SelectOption('Stop playing preludes').andThen(() => undefined),
    );
    const saved = select.cb;
    select.andThen(([card]) => {
      saved([card]);
      const index = player.game.preludeDeck.discardPile.indexOf(card);
      if (index >= 0) {
        player.game.preludeDeck.discardPile.splice(index, 1);
      }
      player.defer(this.playPreludes(player, cards.filter((c) => c !== card), left - 1));
      return undefined;
    });
    return options;
  }

  /** Moves cards from the discard pile into the player's hand. */
  public static take(player: IPlayer, cards: ReadonlyArray<IProjectCard>) {
    const pile = player.game.projectDeck.discardPile;
    for (const card of cards) {
      const index = pile.indexOf(card);
      if (index >= 0) {
        pile.splice(index, 1);
        player.cardsInHand.push(card);
      }
    }
    if (cards.length > 0) {
      player.game.log('${0} took ${1} card(s) from the discard pile', (b) => b.player(player).number(cards.length));
    }
  }

  /**
   * The research step: no new cards; buy any of the cards discarded this research phase for 1 M€ each
   * (free in generation 1).
   */
  public static research(player: IPlayer, done: () => void): PlayerInput {
    const corp = player.tableau.get(CardName.SCAVENGER) as Scavenger | undefined;
    const names = corp?.data.discards;
    const pile = player.game.projectDeck.discardPile.filter((card) => names === undefined || names.includes(card.name));
    if (corp !== undefined) {
      corp.data.discards = undefined;
    }
    const price = player.game.generation === 1 ? 0 : 1;
    const max = price === 0 ? pile.length : Math.min(pile.length, Math.floor(player.megaCredits / price));
    if (max === 0) {
      return new SelectOption('Scavenger: no discarded cards to buy', 'OK').andThen(() => {
        done();
        return undefined;
      });
    }
    return new SelectCard(`Scavenger: buy discarded cards (${price} M€ each)`, 'Buy', pile, {min: 0, max}).andThen((cards) => {
      player.stock.deduct(Resource.MEGACREDITS, cards.length * price, {log: true});
      Scavenger.take(player, cards);
      done();
      return undefined;
    });
  }
}
