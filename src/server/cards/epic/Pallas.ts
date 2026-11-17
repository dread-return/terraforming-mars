import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';

export class Pallas extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PALLAS,
      tags: [Tag.SPACE],
      startingMegaCredits: 36,
      behavior: {
        stock: {titanium: 4},
      },
      action: {
        spend: {titanium: 4},
        global: {temperature: 1},
        removeAnyPlants: 2,
      },

      metadata: {
        cardNumber: 'EP-PAL',
        description: 'You start with 36 M€ and 4 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36).titanium(4).br;
          b.effect('When you play a space event card, gain 1 titanium.', (eb) => {
            eb.tag(Tag.EVENT).tag(Tag.SPACE).startEffect.titanium(1);
          }).br;
          b.action('Spend 4 titanium to raise the temperature 1 step and remove up to 2 plants from any player.', (eb) => {
            eb.titanium(4).startAction.temperature(1).minus().plants(2, {all: true});
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT && card.tags.includes(Tag.SPACE)) {
      player.stock.add(Resource.TITANIUM, 1, {log: true, from: {card: this}});
    }
  }
}
