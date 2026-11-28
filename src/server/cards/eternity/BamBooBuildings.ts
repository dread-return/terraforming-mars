import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
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
        text: 'Draw a plant card',
        drawCard: {count: 1, tag: Tag.PLANT},
      },
      metadata: {
        cardNumber: 'EC08',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).production((pb) => pb.steel(1).plants(1)).cards(1, {secondaryTag: Tag.PLANT}).br;
          b.plainText('You start with 32 M€, 1 plant production and 1 steel production. As your first action, draw a card with a plant tag.').br;
          b.action('All players gain one plant.', (eb) => eb.empty().startAction.plants(1, {all})).br;
          b.effect('You may use plants to pay for cards with a plant tag, at 3 M€ each.', (eb) => eb.tag(Tag.PLANT).startEffect.plants(1).equals().megacredits(3));
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
  // Paying with plants is in Player.paymentOptionsForCard (EpicHooks.plantsValueFor).
}
