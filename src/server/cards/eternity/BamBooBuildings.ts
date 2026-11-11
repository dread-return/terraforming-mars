import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class BamBooBuildings extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BAMBOO_BUILDINGS,
      tags: [Tag.PLANT, Tag.BUILDING],
      startingMegaCredits: 32,
      behavior: {
        production: {steel: 1, plants: 1},
      },
      firstAction: {
        text: 'Draw a building card',
        drawCard: {count: 1, tag: Tag.BUILDING},
      },
      metadata: {
        cardNumber: 'EC08',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).production((pb) => pb.steel(1).plants(1)).cards(1, {secondaryTag: Tag.BUILDING}).br;
          b.plainText('You start with 32 M€, one plant and one steel production. As your first action, draw a card with a building tag.').br;
          b.action('All players gain one plant.', (eb) => eb.empty().startAction.plants(1, {all})).br;
          b.effect('You may use steel to pay for cards with a plant tag.', (eb) => eb.tag(Tag.PLANT).startEffect.steel(1).equals().megacredits(2)).br;
          b.effect('Whenever you play a card with a building tag, gain one plant.', (eb) => eb.tag(Tag.BUILDING).startEffect.plants(1)).br;
          b.effect('You may use plants as steel.', (eb) => eb.text('X').plants(1).startEffect.text('X').steel(1));
        }),
      },
    });
  }

  public canAct() {
    return true;
  }
  public action(player: IPlayer) {
    for (const p of player.game.players) {
      p.stock.add(Resource.PLANTS, 1, {log: true});
    }
    return undefined;
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.BUILDING).length;
    if (n > 0) {
      player.stock.add(Resource.PLANTS, n, {log: true});
    }
    return undefined;
  }
}
