import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';

/** S41. Protection is checked in Player.isProtected and RemoveResourcesFromCard, see antiFraud.ts. */
export class AntiFraudInvestigation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ANTI_FRAUD_INVESTIGATION,
      tags: [],
      cost: 1,
      requirements: {party: PartyName.CENTRISTS},

      metadata: {
        cardNumber: 'S41',
        renderData: CardRenderer.builder((b) => {
          b.text('For the rest of this generation, no player can remove other players\' resources.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Requires that Centrists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public generationUsed: number | undefined = undefined;

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    return undefined;
  }
}
