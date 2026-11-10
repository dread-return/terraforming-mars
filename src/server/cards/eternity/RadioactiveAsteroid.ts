import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class RadioactiveAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.RADIOACTIVE_ASTEROID,
      tags: [Tag.RADIOACTIVE, Tag.SPACE, Tag.EVENT],
      cost: 21,
      behavior: {
        global: {temperature: 1},
        production: {energy: 1},
        drawCard: 2,
        addResourcesToAnyCard: {count: 3, type: CardResource.RADIATION},
      },
      metadata: {
        cardNumber: 'E108',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).production((pb) => pb.energy(1)).cards(2).br.resource(CardResource.RADIATION, 3).asterix().minus().resource(CardResource.ANIMAL, {all});
        }),
        description: 'Raise the temperature 1 step. Increase your energy production 1 step. Draw 2 cards. Add 3 radiation to another card. Remove up to 1 animal from any player.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {source: 'opponents', blockable: true}));
    return undefined;
  }
}
