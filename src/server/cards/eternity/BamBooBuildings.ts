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
          b.corpBox('effect-action', (ce) => {
            ce.action('All players gain 1 plant.', (eb) => eb.empty().startAction.plants(1, {all}));
            ce.effect('Steel pays for plant cards. Gain 1 plant per building tag you play.', (eb) => eb.tag(Tag.BUILDING).startEffect.plants(1).asterix());
          });
        }),
        description: 'You start with 32 M\u20ac, 1 steel and 1 plant production. First action: draw a building card.',
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
