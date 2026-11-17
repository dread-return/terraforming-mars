import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {MercuryColonies} from '../../mercury/MercuryColonies';

export class MercurialBase extends PreludeCard {
  constructor() {
    super({
      name: CardName.MERCURIAL_BASE,
      tags: [Tag.BUILDING, Tag.MERCURY],
      metadata: {
        cardNumber: 'MMP03',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).asterix().actCard(1).asterix().asset(4);
        }),
        description: 'Place a colony on Mercury. Play an Act card (even without agreement) and add 4 assets to it.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => MercuryColonies.placeColonyOnMercury(player));
    player.defer(() => Mercury.developWithoutAgreement(player, 4));
    return undefined;
  }
}
