import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {Tag} from '../../../common/cards/Tag';

export class MadNess extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MADNESS,
      tags: [Tag.WILD],
      startingMegaCredits: 29,
      initialActionText: 'Discard the top card of the deck',
      cardCost: 2,
      metadata: {
        cardNumber: 'EC16',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(29).cards(1).asterix().br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('Buying cards costs 2 M€, incl. your starting hand.', (eb) => eb.cards(1).startEffect.megacredits(2));
            ce.action('Pay 5 M€, discard a card: +1 matching production per building/power/space/plant tag on it.', (eb) => eb.megacredits(5).cards(1).asterix().startAction.production((pb) => pb.wild(1)).asterix());
          });
        }),
        description: 'You start with 29 M\u20ac. First action: discard the top card; +1 steel/energy/titanium/plant production per building/power/space/plant tag on it, else +1 M\u20ac production.',
      },
    });
  }

  private static produceFor(player: IPlayer, tags: ReadonlyArray<Tag>, fallback: boolean) {
    let any = false;
    for (const t of tags) {
      const r = t === Tag.BUILDING ? Resource.STEEL : t === Tag.POWER ? Resource.ENERGY : t === Tag.SPACE ? Resource.TITANIUM : t === Tag.PLANT ? Resource.PLANTS : undefined;
      if (r !== undefined) {
        player.production.add(r, 1, {log: true});
        any = true;
      }
    }
    if (!any && fallback) {
      player.production.add(Resource.MEGACREDITS, 1, {log: true});
    }
  }
  public override initialAction(player: IPlayer) {
    const game = player.game;
    const card = game.projectDeck.draw(game);
    if (card !== undefined) {
      game.log('${0} discarded ${1}', (b) => b.player(player).card(card));
      game.projectDeck.discard(card);
      MadNess.produceFor(player, card.tags, true);
    }
    return undefined;
  }
  public canAct(player: IPlayer) {
    return player.cardsInHand.length > 0 && player.canAfford(5);
  }
  public action(player: IPlayer) {
    return new SelectCard('Pay 5 M€ and discard a card', 'Discard', player.cardsInHand).andThen(([card]) => {
      player.stock.deduct(Resource.MEGACREDITS, 5);
      player.discardCardFromHand(card, {log: true});
      MadNess.produceFor(player, card.tags, false);
      return undefined;
    });
  }
}
