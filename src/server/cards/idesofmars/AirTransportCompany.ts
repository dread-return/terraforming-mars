import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IdesOfMars} from './IdesOfMars';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class AirTransportCompany extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.AIR_TRANSPORT_COMPANY,
      tags: [Tag.VENUS],
      cost: 9,
      requirements: {tag: Tag.VENUS, count: 2},
      victoryPoints: 1,

      metadata: {
        cardNumber: 'I49',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.FLOATER, 2).asterix().br;
          b.text('move up to 4').resource(CardResource.FLOATER).asterix();
        }),
        description: 'Requires 2 Venus tags. Add 2 floaters to any card. Move up to 4 floaters between two of your cards.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // The move happens after the 2 new floaters are added.
    player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 2}))
      .andThen(() => player.defer(() => IdesOfMars.moveResources(player, CardResource.FLOATER, 4)));
    return undefined;
  }
}
