import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all, digit} from '../Options';

export class NuclearWinter extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NUCLEAR_WINTER,
      tags: [Tag.RADIOACTIVE, Tag.MARS],
      cost: 12,
      victoryPoints: 1,
      behavior: {
        production: {plants: -1, steel: 2},
        decreaseAnyProduction: {type: Resource.HEAT, count: 1},
        or: {
          behaviors: [
            {title: 'Remove 2 plants from any player', removeAnyPlants: 2},
            {title: 'Remove 2 microbes from any player', removeResourcesFromAnyCard: {type: CardResource.MICROBE, count: 2}},
          ],
        },
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 2},
      },

      metadata: {
        cardNumber: 'N03',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().plants(1).heat(1, {all}).br.plus().steel(2)).br;
          b.minus().plants(2, {all, digit}).or().resource(CardResource.MICROBE, {amount: 2, all, digit}).br;
          b.resource(CardResource.RADIATION, 2).asterix();
        }),
        description: 'Requires at most 5 other cards in your hand. Decrease your plant production and any heat production 1 step. ' +
          'Increase your steel production 2 steps. Remove 2 plants OR 2 microbes from any player. Add 2 radiation to ANY card.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.cardsInHand.filter((card) => card.name !== this.name).length <= 5;
  }
}
