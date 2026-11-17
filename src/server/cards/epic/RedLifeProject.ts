import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';

export class RedLifeProject extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.RED_LIFE_PROJECT,
      tags: [Tag.ANIMAL, Tag.PLANT],
      startingMegaCredits: 34,
      resourceType: CardResource.ANIMAL,
      behavior: {
        production: {plants: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-RLP',
        description: 'You start with 34 M€ and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(34).production((pb) => pb.plants(1)).br;
          b.effect('When you play an animal or plant tag, including these 2, add an animal to this card.', (eb) => {
            eb.tag(Tag.ANIMAL).slash().tag(Tag.PLANT).startEffect.resource(CardResource.ANIMAL);
          }).br;
          b.action('Move up to 3 animals from this card to ANOTHER card, or remove up to 3 animals from this card to gain 4 M€ each.', (eb) => {
            eb.resource(CardResource.ANIMAL, 3).startAction.resource(CardResource.ANIMAL, 3).asterix().or().megacredits(4).text('each');
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, [Tag.ANIMAL, Tag.PLANT]);
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }

  public override bespokeCanAct() {
    return this.resourceCount > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const max = Math.min(3, this.resourceCount);
    const sell = new SelectOption('Remove animals from this card for 4 M€ each').andThen(() => {
      return new SelectAmount('Select the number of animals to remove', 'Remove', 1, max, true).andThen((amount) => {
        player.removeResourceFrom(this, amount, {log: true});
        player.stock.add(Resource.MEGACREDITS, 4 * amount, {log: true});
        return undefined;
      });
    });
    const targets = player.getResourceCards(CardResource.ANIMAL).filter((c) => c !== this);
    if (targets.length === 0) {
      return sell;
    }
    const move = new SelectOption('Move animals from this card to another card').andThen(() => {
      return new SelectCard('Select the card to receive the animals', 'Move animals', targets).andThen(([target]) => {
        return new SelectAmount('Select the number of animals to move', 'Move', 1, max, true).andThen((amount) => {
          player.removeResourceFrom(this, amount);
          player.addResourceTo(target, {qty: amount, log: true});
          return undefined;
        });
      });
    });
    return new OrOptions(move, sell);
  }
}
