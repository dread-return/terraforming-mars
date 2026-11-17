import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardType} from '../../../common/cards/CardType';
import {ActHelpers} from '../../mercury/ActHelpers';

export class HealthAndSafetyInspections extends ActCard {
  constructor() {
    super({
      name: CardName.HEALTH_AND_SAFETY_INSPECTIONS,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'ACT46',
        renderData: CardRenderer.builder((b) => {
          b.text('victory: 1 VP', {size: Size.SMALL}).br.text('defeat:', {size: Size.SMALL}).minus().megacredits(1).slash().text('active card', {size: Size.SMALL});
        }),
        description: 'Victory: 1 victory point at the end of the game. Defeat: pay 1 M€ for every active card you have played.',
      },
    });
  }

  public override defeat(defeated: IPlayer) {
    ActHelpers.payUpTo(defeated, defeated.playedCards.asArray().filter((c) => c.type === CardType.ACTIVE).length);
  }
}
