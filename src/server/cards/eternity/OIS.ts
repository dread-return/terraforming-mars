import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class OIS extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OIS,
      tags: [Tag.WILD],
      startingMegaCredits: 50,
      initialActionText: 'Each opponent reveals a card from their hand',
      metadata: {
        cardNumber: 'EC05',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50).cards(1, {all}).br;
          b.plainText('You start with 50 M€, and each player draws a card after selecting corps. Then each opponent reveals a card from their hand.').br;
          b.plainText('Every production phase, each opponent reveals any number of cards. Anyone who can\'t loses 1 TR. The player with the most revealed cards gains').br;
          b.production((pb) => pb.megacredits(1)).text('OR', {size: Size.SMALL}).megacredits(4).br;
          b.action('Steal a revealed card from an opponent.', (eb) => eb.empty().startAction.cards(1, {all}).asterix());
        }),
      },
    });
  }

  public data: {faceUp: Record<string, Array<string>>, used: Record<string, number>} = {faceUp: {}, used: {}};

  public faceUpCards(p: IPlayer): Array<IProjectCard> {
    const names = this.data.faceUp[p.id] ?? [];
    return p.cardsInHand.filter((c) => names.includes(c.name));
  }
  private faceDownCards(p: IPlayer): Array<IProjectCard> {
    const names = this.data.faceUp[p.id] ?? [];
    return p.cardsInHand.filter((c) => !names.includes(c.name));
  }
  private placeFaceUp(p: IPlayer, cards: ReadonlyArray<{name: string}>) {
    const current = this.faceUpCards(p).map((c) => c.name);
    this.data = {...this.data, faceUp: {...this.data.faceUp, [p.id]: [...current, ...cards.map((c) => c.name)]}};
    p.game.log('${0} revealed ${1}', (b) => b.player(p).cards(cards as Array<IProjectCard>));
  }
  /** Asks `p` to reveal cards from hand (1, or 1 or more when `any`). False when they have nothing left to reveal. */
  private ask(p: IPlayer, any: boolean) {
    const cards = this.faceDownCards(p);
    if (cards.length === 0) {
      return false;
    }
    const title = any ? 'O.I.S.: reveal any number of cards from your hand (at least 1; they stay in your hand)' : 'O.I.S.: reveal a card from your hand (it stays in your hand)';
    p.defer(new SelectCard(title, 'Reveal', cards, {min: 1, max: any ? cards.length : 1}).andThen((selected) => {
      this.placeFaceUp(p, selected);
      return undefined;
    }));
    return true;
  }
  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      p.drawCard();
    }
    return undefined;
  }
  public override initialAction(player: IPlayer) {
    for (const p of player.opponents) {
      this.ask(p, false);
    }
    return undefined;
  }
  public onProductionPhase(player: IPlayer) {
    const game = player.game;
    const last = game.gameIsOver();
    for (const p of player.opponents) {
      if (!this.ask(p, true) && !last) {
        p.decreaseTerraformRating(1, {log: true});
      }
    }
    if (last) {
      return undefined;
    }
    player.defer(() => {
      const counts = player.opponents.map((p) => this.faceUpCards(p).length);
      const max = Math.max(0, ...counts);
      if (max === 0) {
        return undefined;
      }
      player.opponents.forEach((p, i) => {
        if (counts[i] !== max) {
          return;
        }
        p.defer(new OrOptions(
          new SelectOption('Increase your M€ production 1 step').andThen(() => {
            p.production.add(Resource.MEGACREDITS, 1, {log: true});
            return undefined;
          }),
          new SelectOption('Gain 4 M€').andThen(() => {
            p.stock.add(Resource.MEGACREDITS, 4, {log: true});
            return undefined;
          })).setTitle('O.I.S.: you have the most revealed cards'));
      });
      return undefined;
    });
    return undefined;
  }
  public canAct(player: IPlayer) {
    return player.opponents.some((p) => this.faceUpCards(p).length > 0);
  }
  public action(player: IPlayer) {
    const owners = new Map<IProjectCard, IPlayer>();
    for (const p of player.opponents) {
      this.faceUpCards(p).forEach((c) => owners.set(c, p));
    }
    return new SelectCard('Steal a revealed card from an opponent', 'Steal', [...owners.keys()]).andThen(([card]) => {
      const from = owners.get(card);
      if (from !== undefined) {
        from.cardsInHand.splice(from.cardsInHand.indexOf(card), 1);
        this.data = {...this.data, faceUp: {...this.data.faceUp, [from.id]: (this.data.faceUp[from.id] ?? []).filter((n) => n !== card.name)}};
        player.cardsInHand.push(card);
        player.game.log('${0} took ${1} from ${2}', (b) => b.player(player).card(card).player(from));
      }
      return undefined;
    });
  }
}
