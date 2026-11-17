import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectResource} from '../../inputs/SelectResource';

export class BacterialNanotechnologyFactories extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      name: CardName.BACTERIAL_NANOTECHNOLOGY_FACTORIES,
      type: CardType.ACTIVE,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 10,
      resourceType: CardResource.MICROBE,
      behavior: {
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 2},
      },
      metadata: {
        cardNumber: 'MM21',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a microbe to this card.', (ab) => {
            ab.empty().startAction.resource(CardResource.MICROBE);
          }).br;
          b.or().br;
          b.action('Remove 2 microbes from this card to increase any production 1 step.', (ab) => {
            ab.resource(CardResource.MICROBE, 2).startAction.production((pb) => pb.wild(1));
          }).br;
          b.resource(CardResource.MICROBE, 2).asterix();
        }),
        description: 'Add 2 microbes to any card.',
      },
    });
  }

  public canAct() {
    return true;
  }

  public action(player: IPlayer) {
    const addMicrobe = new SelectOption('Add a microbe to this card').andThen(() => {
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    if (this.resourceCount < 2) {
      return addMicrobe;
    }
    return new OrOptions(
      addMicrobe,
      new SelectOption('Remove 2 microbes to increase any production 1 step').andThen(() => {
        player.removeResourceFrom(this, 2, {log: true});
        return new SelectResource('Select a production to increase 1 step').andThen((unit) => {
          player.production.add(unit, 1, {log: true});
          return undefined;
        });
      }),
    );
  }
}
