import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ActHelpers} from '../../mercury/ActHelpers';

export class ExperimentSabotage extends ActCard {
  constructor() {
    super({
      name: CardName.EXPERIMENT_SABOTAGE,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.MICROBE],
      metadata: {
        cardNumber: 'ACT39',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).minus().resource(CardResource.MICROBE, 2).asterix().br.text('defeat:', {size: Size.SMALL}).minus().megacredits(1).slash().city();
        }),
        description: 'Targeted player requires a microbe tag. Victory: steal up to 2 microbes from the defeated player. Defeat: pay 1 M€ for every city you own.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.tags.count(Tag.MICROBE, 'raw') > 0;
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated !== undefined) {
      ActHelpers.stealCardResources(victor, defeated, CardResource.MICROBE, 2);
    }
  }

  public override defeat(defeated: IPlayer) {
    ActHelpers.payUpTo(defeated, defeated.game.board.getCities(defeated).length);
  }
}
