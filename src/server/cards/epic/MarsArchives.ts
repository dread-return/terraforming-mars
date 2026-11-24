import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {ChooseCards} from '../../deferredActions/ChooseCards';
import {newProjectCard} from '../../createCard';

export class MarsArchives extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.MARS_ARCHIVES,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 53,
      resourceType: CardResource.ARCHIVED_CARD,
      initialActionText: 'Draw 3 cards, keep 1',

      action: {},

      metadata: {
        cardNumber: 'EP-MAR',
        description: 'You start with 53 M€. First action: draw 3 cards, keep 1 and discard the others.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(53).cards(3);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Your discards may be archived here face down (1 per science tag).', (eb) => {
              eb.cards(1, {cancelled: true}).startEffect.resource(CardResource.ARCHIVED_CARD).slash().tag(Tag.SCIENCE);
            });
            ce.vSpace(Size.TINY);
            ce.action('3 M€ each: take archived cards into hand, OR discard any.', (eb) => {
              eb.megacredits(3).slash().resource(CardResource.ARCHIVED_CARD).startAction.cards(1).or().cards(1, {cancelled: true});
            });
          });
        }),
      },
    });
  }

  public data: {archive: Array<CardName>} = {archive: []};

  private sync() {
    this.resourceCount = this.data.archive.length;
  }

  public room(player: IPlayer): number {
    return Math.max(0, player.tags.count(Tag.SCIENCE, 'raw') - this.data.archive.length);
  }

  public override initialAction(player: IPlayer) {
    const cards = player.game.projectDeck.drawN(player.game, 3);
    player.game.defer(new ChooseCards(player, cards, {keepMax: 1}));
    return undefined;
  }

  /** Offers to archive some of the cards `player` just discarded (they come back out of the discard pile). */
  public offerArchive(player: IPlayer, discarded: ReadonlyArray<IProjectCard>) {
    const room = this.room(player);
    if (room === 0 || discarded.length === 0) {
      return;
    }
    player.defer(new SelectCard(`Mars Archives: archive up to ${room} of the discarded cards`, 'Archive', discarded, {min: 0, max: Math.min(room, discarded.length)})
      .andThen((cards) => {
        const pile = player.game.projectDeck.discardPile;
        for (const card of cards) {
          const index = pile.indexOf(card);
          if (index >= 0) {
            pile.splice(index, 1);
            this.data.archive.push(card.name);
          }
        }
        this.sync();
        if (cards.length > 0) {
          player.game.log('${0} archived ${1} card(s)', (b) => b.player(player).number(cards.length));
        }
        return undefined;
      }));
  }

  private archived(): Array<IProjectCard> {
    return this.data.archive.map((name) => newProjectCard(name)).filter((c) => c !== undefined);
  }

  public override bespokeCanAct() {
    return this.data.archive.length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.archived();
    const options: Array<SelectOption> = [];
    const affordable = Math.min(cards.length, Math.floor(player.megaCredits / 3));
    if (affordable > 0) {
      options.push(new SelectOption('Take archived cards into your hand (3 M€ each)').andThen(() =>
        new SelectCard('Take into hand', 'Take', cards, {min: 1, max: affordable}).andThen((taken) => {
          player.stock.deduct(Resource.MEGACREDITS, 3 * taken.length, {log: true});
          for (const card of taken) {
            this.data.archive.splice(this.data.archive.indexOf(card.name), 1);
            player.cardsInHand.push(card);
          }
          this.sync();
          return undefined;
        })));
    }
    options.push(new SelectOption('Discard archived cards').andThen(() =>
      new SelectCard('Discard from the archives', 'Discard', cards, {min: 1, max: cards.length}).andThen((discards) => {
        for (const card of discards) {
          this.data.archive.splice(this.data.archive.indexOf(card.name), 1);
        }
        player.game.projectDeck.discard(...discards);
        this.sync();
        return undefined;
      })));
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options).setTitle('Mars Archives');
  }
}
