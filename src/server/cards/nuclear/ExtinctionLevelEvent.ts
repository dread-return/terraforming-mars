import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all} from '../Options';

export class ExtinctionLevelEvent extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.EXTINCTION_LEVEL_EVENT,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 27,
      behavior: {
        global: {temperature: 2},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 3},
      },

      metadata: {
        cardNumber: 'N47',
        renderData: CardRenderer.builder((b) => {
          b.temperature(2).nbsp.minus().resource(CardResource.MICROBE, {amount: 2, all}).resource(CardResource.ANIMAL, {amount: 2, all}).br;
          b.resource(CardResource.RADIATION, 3).asterix();
        }),
        description: 'Raise the temperature 2 steps. Remove 2 microbes and 2 animals from any player or players. Add 3 radiation to ANY card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.MICROBE, 2, {mandatory: false}));
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 2, {mandatory: false}));
    return undefined;
  }
}
