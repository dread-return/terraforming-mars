import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {ActionCard} from '../ActionCard';
import {IProjectCard} from '../IProjectCard';
import {all} from '../Options';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class SpiresOfVenus extends ActionCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.SPIRES_OF_VENUS,
      type: CardType.ACTIVE,
      tags: [Tag.VENUS, Tag.BUILDING],
      cost: 14,
      resourceType: CardResource.DATA,
      victoryPoints: 1,
      behavior: {
        production: {energy: -1},
      },
      action: {
        spend: {resourcesHere: 2},
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'MM37',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any player raises Venus, add 1 data to any card for each step.', (eb) => {
            eb.venus(1, {all}).startEffect.resource(CardResource.DATA).asterix();
          }).br;
          b.action('Spend 2 data here and 1 steel to raise Venus 1 step.', (ab) => {
            ab.resource(CardResource.DATA, 2).steel(1).startAction.venus(1);
          }).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Decrease your energy production 1 step.',
      },
    });
  }

  // The action also costs 1 steel.
  public override bespokeCanAct(player: IPlayer) {
    return player.steel >= 1;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.deduct(Resource.STEEL, 1, {log: true});
    return undefined;
  }
}
