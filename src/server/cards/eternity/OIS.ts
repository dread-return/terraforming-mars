import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {Eternity} from './Eternity';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {PlayerInput} from '../../PlayerInput';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class OIS extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OIS,
      tags: [Tag.WILD],
      startingMegaCredits: 50,
      initialActionText: 'Other players place a card face up',
      metadata: {
        cardNumber: 'EC05',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50).cards(1, {all}).br;
          b.corpBox('action', (ce) => {
            ce.action('Take a shown card.', (eb) => eb.empty().startAction.cards(1, {all}).asterix());
          });
        }),
        description: 'All draw a card. First action: others show a card. Each production: others show a card or -1 TR; most shown: +1 M\u20ac prod. or 4 M\u20ac.',
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
    p.game.log('${0} placed ${1} face up', (b) => b.player(p).cards(cards as Array<IProjectCard>));
  }
  private askOne(p: IPlayer) {
    const cards = this.faceDownCards(p);
    if (cards.length === 0) {
      return false;
    }
    p.defer(new SelectCard('O.I.S.: place a card from your hand face up (it stays in your hand)', 'Place face up', cards, {min: 1, max: 1}).andThen((selected) => {
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
      this.askOne(p);
    }
    return undefined;
  }
  public onProductionPhase(player: IPlayer) {
    const game = player.game;
    const last = game.gameIsOver();
    for (const p of player.opponents) {
      if (!this.askOne(p) && !last) {
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
          })).setTitle('O.I.S.: you have the most face-up cards'));
      });
      return undefined;
    });
    return undefined;
  }
  /** Once per generation, opponents may place any number of cards face up as an action. */
  public revealAction(owner: IPlayer, target: IPlayer): PlayerInput | undefined {
    if (this.data.used[target.id] === owner.game.generation) {
      return undefined;
    }
    const cards = this.faceDownCards(target);
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectOption('Place cards face up (O.I.S.)').andThen(() => Eternity.selectCardsToReveal(target, cards, 1, (selected) => {
      this.data = {...this.data, used: {...this.data.used, [target.id]: owner.game.generation}};
      this.placeFaceUp(target, selected);
    }));
  }
  public canAct(player: IPlayer) {
    return player.opponents.some((p) => this.faceUpCards(p).length > 0);
  }
  public action(player: IPlayer) {
    const owners = new Map<IProjectCard, IPlayer>();
    for (const p of player.opponents) {
      this.faceUpCards(p).forEach((c) => owners.set(c, p));
    }
    return new SelectCard('Take a face-up card from another player', 'Take', [...owners.keys()]).andThen(([card]) => {
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
