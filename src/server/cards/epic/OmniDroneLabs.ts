import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';

export class OmniDroneLabs extends CorporationCard {
  constructor() {
    super({
      name: CardName.OMNIDRONE_LABS,
      tags: [Tag.ANIMAL, Tag.SCIENCE],
      startingMegaCredits: 40,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 3},
      firstAction: {
        text: 'Draw 2 cards',
        drawCard: 2,
      },

      metadata: {
        cardNumber: 'EP-OMD',
        description: 'You start with 40 M€. First action: draw 2 cards.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).cards(2);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Science cards: pay with plants or animals here, 2 M€ each.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.plants(1).slash().resource(CardResource.ANIMAL).equals().megacredits(2);
            });
            ce.effect('Any science tag played (incl. this): add an animal here.', (eb) => {
              eb.tag(Tag.SCIENCE, {all}).startEffect.resource(CardResource.ANIMAL);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(owner: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.SCIENCE).length;
    if (count > 0) {
      owner.addResourceTo(this, {qty: count, log: true});
    }
  }
}
