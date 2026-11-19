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

export class GAIA extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.G_AI_A,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 50,
      resourceType: CardResource.SCIENCE,

      behavior: {
        stock: {plants: 2},
        addResources: 2,
      },

      metadata: {
        cardNumber: 'EP-GAI',
        description: 'You start with 50 M€, 2 plants and 2 science here. Opponents cannot remove your plants, animals or microbes.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(50).plants(2).resource(CardResource.SCIENCE, 2);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.TINY);
            ce.effect('Any plant, animal or science tag: +1 science here.', (eb) => {
              eb.tag(Tag.PLANT, {all}).tag(Tag.ANIMAL, {all}).tag(Tag.SCIENCE, {all}).startEffect.resource(CardResource.SCIENCE);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Any time: science here → microbe 1:1, plant 2:1, animal 3:1.', (eb) => {
              eb.resource(CardResource.SCIENCE).startEffect.resource(CardResource.MICROBE).slash().text('2').plants(1).slash().text('3').resource(CardResource.ANIMAL);
            });
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = thisCardOwner.tags.cardTagCount(card, [Tag.PLANT, Tag.ANIMAL, Tag.SCIENCE]);
    if (count > 0) {
      thisCardOwner.addResourceTo(this, {qty: count, log: true});
    }
  }
  // Protection is in Player.plantsAreProtected; exchanges are free conversions in EpicHooks.freeActionOption.
}
