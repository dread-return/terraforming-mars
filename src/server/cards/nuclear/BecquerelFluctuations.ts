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

export class BecquerelFluctuations extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BECQUEREL_FLUCTUATIONS,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 9,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},

      metadata: {
        cardNumber: 'N09',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you increase or decrease your titanium production, gain 1 titanium and add a radiation to ANY card.', (eb) => {
            eb.production((pb) => pb.plus().titanium(1)).slash().production((pb) => pb.minus().titanium(1))
              .startEffect.titanium(1).resource(CardResource.RADIATION).asterix();
          }).br;
          b.vpText('1 VP for every 4 radiation on this card.');
        }),
      },
    });
  }

  public onProductionGain(player: IPlayer, resource: Resource, amount: number) {
    if (resource === Resource.TITANIUM && amount !== 0) {
      player.stock.add(Resource.TITANIUM, 1, {log: true});
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
    }
  }
}
