import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class FarmsOfTheFuture extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FARMS_OF_THE_FUTURE,
      tags: [Tag.PLANT, Tag.SCIENCE, Tag.SPACE],
      startingMegaCredits: 53,
      action: {
        spend: {megacredits: 10},
        production: {plants: 1},
      },
      metadata: {
        cardNumber: 'EC10',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(53).br;
          b.effect('When you play a space or science tag, including these, gain a plant.', (eb) => eb.tag(Tag.SPACE).slash().tag(Tag.SCIENCE).startEffect.plants(1)).br;
          b.action('Pay 10 M€ to increase your plant production 1 step.', (eb) => eb.megacredits(10).startAction.production((pb) => pb.plants(1)));
        }),
        description: 'You start with 53 M\u20ac.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.SPACE || t === Tag.SCIENCE).length;
    if (n > 0) {
      player.stock.add(Resource.PLANTS, n, {log: true});
    }
    return undefined;
  }
}
