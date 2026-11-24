import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';

export class PegasusGroup extends CorporationCard {
  constructor() {
    super({
      name: CardName.PEGASUS_GROUP,
      tags: [Tag.SCIENCE, Tag.SPACE],
      startingMegaCredits: 50,
      resourceType: CardResource.SCIENCE,

      metadata: {
        cardNumber: 'EP-PEG',
        description: 'You start with 50 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.SPACE).startEffect.resource(CardResource.SCIENCE);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Space tag played (incl. this): add a science here. Science here pays 2 M€ each for space and science cards.', (eb) => {
              eb.tag(Tag.SPACE).slash().tag(Tag.SCIENCE).startEffect.resource(CardResource.SCIENCE).equals().megacredits(2);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.SPACE).length;
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
