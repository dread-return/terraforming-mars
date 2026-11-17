import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ActHelpers} from '../../mercury/ActHelpers';

export class TerritorialRightsDispute extends ActCard {
  constructor() {
    super({
      name: CardName.TERRITORIAL_RIGHTS_DISPUTE,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      defeatBehavior: {tr: -1},
      metadata: {
        cardNumber: 'ACT49',
        renderData: CardRenderer.builder((b) => {
          b.text('victory: reserve 2', {size: Size.SMALL}).emptyTile().asterix().br.text('defeat:', {size: Size.SMALL}).minus().tr(1);
        }),
        description: 'Victory: reserve 2 non-reserved and connected areas on Mars. Receive their placement bonuses. Defeat: -1 TR.',
      },
    });
  }

  public override victory(victor: IPlayer) {
    ActHelpers.reserveConnected(victor, 2, {fromOwnTiles: false, gainBonuses: true});
  }
}
