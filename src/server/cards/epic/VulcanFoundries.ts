import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class VulcanFoundries extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.VULCAN_FOUNDRIES,
      tags: [Tag.POWER],
      startingMegaCredits: 37,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 3},
      cardDiscount: {tag: Tag.POWER, amount: 1},
      behavior: {
        production: {energy: 1, heat: 1},
      },

      metadata: {
        cardNumber: 'EP-VUL',
        description: 'You start with 1 energy and 1 heat production, and 37 M€. 1 VP per 3 radiation here.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.production((pb) => pb.energy(1).heat(1)).nbsp.megacredits(37);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Power tags cost 1 M€ less. When you play one, gain 1 heat and add 1 radiation to ANY card.', (eb) => {
              eb.tag(Tag.POWER).startEffect.megacredits(-1).heat(1).resource(CardResource.RADIATION).asterix();
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.POWER);
    if (count > 0) {
      player.stock.add(Resource.HEAT, count, {log: true, from: {card: this}});
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count}));
    }
  }
}
