import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class ElonLabs extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ELON_LABS,
      tags: [Tag.WILD],
      startingMegaCredits: 40,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-ELN',
        description: 'You start with 40 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play a card with requirements, add a non-science resource to any of your blue cards.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.REQ}).startEffect.wild(1).asterix().nbsp.resource(CardResource.SCIENCE, {cancelled: true});
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this || (card.requirements?.length ?? 0) === 0) {
      return;
    }
    player.game.defer(new AddResourcesToCard(player, undefined, {
      count: 1,
      filter: (c) => c.type === CardType.ACTIVE && c.resourceType !== CardResource.SCIENCE,
      title: 'Elon Labs: add 1 resource to a blue card',
    }));
  }
}
