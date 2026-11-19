import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';

export class ELM extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ELM,
      tags: [Tag.EARTH],
      startingMegaCredits: 38,
      resourceType: CardResource.INFLUENCE,
      victoryPoints: {resourcesHere: {}, per: 3},

      metadata: {
        cardNumber: 'EP-ELM',
        description: 'You start with 38 M€. 1 VP per 3 influence here.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(38);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When anyone plays an Earth tag, add 1 influence here.', (eb) => {
              eb.tag(Tag.EARTH, {all}).startEffect.resource(CardResource.INFLUENCE);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('At any time, you may spend influence here for 2 M€ each.', (eb) => {
              eb.resource(CardResource.INFLUENCE).startEffect.megacredits(2);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const earth = thisCardOwner.tags.cardTagCount(card, Tag.EARTH);
    if (earth > 0) {
      thisCardOwner.addResourceTo(this, {qty: earth, log: true});
    }
  }
  // Spending is a free conversion in EpicHooks.freeActionOption.
}
