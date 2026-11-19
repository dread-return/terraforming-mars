import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';

export class DarwinEvolution extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DARWIN_EVOLUTION,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 38,
      resourceType: CardResource.SCIENCE,

      firstAction: {
        text: 'Reveal cards until you reveal two with an animal tag, and take them',
        drawCard: {count: 2, tag: Tag.ANIMAL},
      },

      metadata: {
        cardNumber: 'EP-DAR',
        description: 'You start with 38 M€. First action: reveal cards until 2 animal tags; take them.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).cards(2, {secondaryTag: Tag.ANIMAL});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.ANIMAL).startEffect.tag(Tag.SCIENCE).plus().resource(CardResource.SCIENCE);
            });
            ce.effect('Animal tags are science (+1 science here each, incl. this). Animal cards: 1 science here = 2 global req. steps.', (eb) => {
              eb.tag(Tag.ANIMAL).startEffect.text('±2').slash().resource(CardResource.SCIENCE);
            });
          });
        }),
      },
    });
  }

  public data: {spend?: Record<string, number>} = {};

  public onCardPlayed(player: IPlayer, card: ICard) {
    const spend = this.data.spend?.[card.name] ?? 0;
    this.data.spend = {};
    if (spend > 0) {
      player.removeResourceFrom(this, Math.min(spend, this.resourceCount), {log: true});
    }
    const animals = player.tags.cardTagCount(card, Tag.ANIMAL);
    if (animals > 0) {
      player.addResourceTo(this, {qty: animals, log: true});
    }
  }
  // Requirements and tag counting are in EpicHooks (bendGlobalRequirement, animalsAreScience).
}
