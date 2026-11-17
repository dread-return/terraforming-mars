import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class LivestockBuyout extends ActCard {
  constructor() {
    super({
      name: CardName.LIVESTOCK_BUYOUT,
      kind: 'rivalry',
      steps: 5,
      tags: [Tag.ANIMAL],
      metadata: {
        cardNumber: 'ACT40',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).minus().resource(CardResource.ANIMAL, 3).asterix().br.text('defeat:', {size: Size.SMALL}).megacredits(2).slash().resource(CardResource.ANIMAL).asterix();
        }),
        description: 'Both players require an animal tag. Victory: steal up to any 3 animals from the defeated player. Defeat: receive 2 M€ for every animal taken from you.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.tags.count(Tag.ANIMAL, 'raw') > 0 && other.tags.count(Tag.ANIMAL, 'raw') > 0;
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated === undefined) {
      return;
    }
    // One animal at a time, so they can come from different cards.
    const takeOne = (left: number): void => {
      if (left <= 0) {
        return;
      }
      victor.defer(() => {
        const sources = defeated.getCardsWithResources(CardResource.ANIMAL).filter((c) => c.protectedResources !== true);
        if (sources.length === 0) {
          return undefined;
        }
        return new SelectCard(`Livestock Buyout: take an animal (${left} left)`, 'Take', sources).andThen(([source]) => {
          defeated.removeResourceFrom(source, 1, {removingPlayer: victor, log: true});
          defeated.stock.add(Resource.MEGACREDITS, 2, {log: true});
          victor.game.defer(new AddResourcesToCard(victor, CardResource.ANIMAL, {count: 1}));
          takeOne(left - 1);
          return undefined;
        });
      });
    };
    takeOne(3);
  }
}
