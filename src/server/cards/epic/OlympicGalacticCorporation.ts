import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class OlympicGalacticCorporation extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OLYMPIC_GALACTIC_CORPORATION,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,

      metadata: {
        cardNumber: 'EP-OGC',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When anyone plays an Earth tag, gain 1 M€ while the oxygen is 10% or less, then 2 M€.', (eb) => {
              eb.tag(Tag.EARTH, {all}).startEffect.megacredits(1).slash().megacredits(2).asterix();
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = thisCardOwner.tags.cardTagCount(card, Tag.EARTH);
    if (count > 0) {
      const each = thisCardOwner.game.getOxygenLevel() <= 10 ? 1 : 2;
      thisCardOwner.stock.add(Resource.MEGACREDITS, each * count, {log: true, from: {card: this}});
    }
  }
}
