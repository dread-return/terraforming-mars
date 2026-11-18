import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class SkyRanchers extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SKY_RANCHERS,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'EP-SKR',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Animal cards\' global requirements are 4 steps easier for you, and you have a wild tag when playing them.', (eb) => {
              eb.tag(Tag.ANIMAL).startEffect.text('±4').nbsp.wild(1);
            });
          });
        }),
      },
    });
  }

  // Eternity's requirement protocol: a bonus for this player's cards.
  public globalRequirementBonusFor(_player: IPlayer, card: ICard): number {
    return card.tags.includes(Tag.ANIMAL) ? 4 : 0;
  }
  // The wild tag is in EpicHooks.extraTagsForRequirement.
}
