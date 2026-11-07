import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all} from '../Options';

export class NuclearWasteLogistics extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NUCLEAR_WASTE_LOGISTICS,
      tags: [Tag.RADIOACTIVE],
      cost: 13,
      requirements: {tag: Tag.POWER, count: 2},
      behavior: {
        decreaseAnyProduction: {type: Resource.MEGACREDITS, count: 1},
        production: {energy: 1, heat: 2},
      },

      metadata: {
        cardNumber: 'N49',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(1, {all}).br.plus().energy(1).heat(2)).br;
          b.resource(CardResource.RADIATION).asterix().slash().text('card with radiation');
        }),
        description: 'Requires 2 power tags. Decrease any M€ production 1 step and increase your energy production 1 step and your heat production 2 steps. ' +
          'Add a radiation to ANY card for every card you own with at least 1 radiation.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const count = player.getCardsWithResources(CardResource.RADIATION).length;
    if (count > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count, log: true}));
    }
    return undefined;
  }
}
