import {CARD_COST} from '../../../common/constants';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';

export class AcquisitionTarget extends PreludeCard {
  constructor() {
    super({
      name: CardName.ACQUISITION_TARGET,
      tags: [],
      behavior: {
        stock: {megacredits: 5},
      },
      metadata: {
        cardNumber: 'EP05',
        renderData: CardRenderer.builder((b) => {
          b.text('5', {size: Size.MEDIUM}).corporation().asterix().megacredits(5);
        }),
        description: "Draw 5 corporation cards. You may play one of them instead of your corporation (its starting M\u20ac, production and resources replace your old corporation's). Discard the rest. Gain 5 M\u20ac.",
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.corporationDeck.drawPile.length > 0 && player.playedCards.corporations().length > 0;
  }
  /** Swaps the corporation: undoes the old one's starting M€, production and resources, then plays the new one. */
  public static swap(player: IPlayer, old: ICorporationCard, corp: ICorporationCard) {
    const game = player.game;
    const production = old.behavior?.production;
    if (production !== undefined) {
      for (const [k, v] of Object.entries(production)) {
        if (typeof v === 'number') {
          player.production.add(k as Resource, -v);
        }
      }
    }
    const stock = old.behavior?.stock;
    if (stock !== undefined) {
      for (const [k, v] of Object.entries(stock)) {
        if (typeof v === 'number') {
          player.stock.deduct(k as Resource, Math.min(v, player.stock.get(k as Resource)));
        }
      }
    }
    if (old.cardCost !== undefined) {
      player.cardCost -= old.cardCost - CARD_COST;
    }
    player.playCorporationCard(corp);
    player.stock.deduct(Resource.MEGACREDITS, Math.min(old.startingMegaCredits, player.megaCredits));
    player.playedCards.remove(old);
    player.pendingInitialActions = player.pendingInitialActions.filter((c) => c !== old);
    game.corporationDeck.discard(old);
    game.log('${0} replaced ${1} with ${2}', (b) => b.player(player).card(old).card(corp));
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const deck = game.corporationDeck;
    const old = player.playedCards.corporations()[0];
    const drawn = deck.drawN(game, 5);
    game.log('${0} drew ${1}', (b) => b.player(player).cards(drawn));
    player.defer(new SelectCard('You may replace your corporation with one of these', 'Play', drawn, {min: 0, max: 1}).andThen(([corp]) => {
      for (const c of drawn) {
        if (c !== corp) {
          deck.discard(c);
        }
      }
      if (corp !== undefined) {
        AcquisitionTarget.swap(player, old, corp);
      }
      return undefined;
    }));
    return undefined;
  }
}
