import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {ALL_RESOURCES} from '../../../common/Resource';

export class CorporateAcquisition extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.CORPORATE_ACQUISITION,
      cost: 7,

      metadata: {
        cardNumber: 'I20',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.wild(1));
        }),
        description: 'Increase any production 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    return new OrOptions(...ALL_RESOURCES.map((resource) =>
      new SelectOption(`Increase ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true});
        return undefined;
      }))).setTitle('Select a production to increase');
  }
}
